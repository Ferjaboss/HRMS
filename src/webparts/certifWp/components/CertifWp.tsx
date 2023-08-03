//importing Modules
import * as React from "react";
import { ICertifWpProps, ICategory, ISubCategory } from "./ICertifWpProps";
import "./../../../tailwind.css";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

require("@fortawesome/fontawesome-free/css/all.min.css");

export interface State {
  isMemberOfHR: boolean;
  isAddModalOpen: boolean;
  searchQuery: string;
  categories: ICategory[];
  selectedCategory: string;
  subCategories: ISubCategory[];
  selectedSubCategory: string;
  isOtherCategorySelected: boolean;
  isOtherSubCategorySelected: boolean;
  certificateAssignments: any[];
  userEmail: string;
}

export default class App extends React.Component<ICertifWpProps, State> {
  //Constructor to initialize the state
  constructor(props: ICertifWpProps) {
    super(props);
    this.state = {
      isMemberOfHR: false,
      isAddModalOpen: false,
      searchQuery: "",
      categories: [],
      selectedCategory: "",
      subCategories: [],
      selectedSubCategory: "",
      isOtherCategorySelected: false,
      isOtherSubCategorySelected: false,
      certificateAssignments: [],
      userEmail: "",
    };
    this.hideAddModal = this.hideAddModal.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleSubCategoryChange = this.handleSubCategoryChange.bind(this);
  }

  private async fetchCategories(): Promise<ICategory[]> {
    const list = sp.web.lists.getByTitle("Certification");
    const items = await list.items.select("Title").get();
    const uniqueCategories = Array.from(
      new Set(items.map((item) => item.Title))
    ); // Filter out duplicates
    return uniqueCategories.map(
      (category) => ({ title: category } as ICategory)
    );
  }

  private async fetchSubCategories(
    categoryTitle: string
  ): Promise<ISubCategory[]> {
    const list = sp.web.lists.getByTitle("Certification");
    const items = await list.items
      .filter(`Title eq '${categoryTitle}'`)
      .select("SubCategorie") // Update the field name here based on your SharePoint list
      .get();
    const uniqueSubCategories = Array.from(
      new Set(items.map((item) => item.SubCategorie))
    ); // Filter out duplicates
    return uniqueSubCategories.map(
      (subCategory) => ({ title: subCategory } as ISubCategory)
    );
  }
  public getStatusLabel(status: string) {
    switch (status.toLowerCase()) {
      case "declined":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            Declined
          </span>
        );
      case "approved":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
            Approved
          </span>
        );
      default:
        return (
          <span className="bg-Deep-Peach text-Princeton-Orange text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </span>
        );
    }
  }
  public async componentDidMount(): Promise<void> {
    sp.setup({
      sp: {
        baseUrl: "https://0331r.sharepoint.com/sites/HR",
      },
    });
  
    // Fetch the current user's email
    const currentUser = await sp.web.currentUser.get();
    const currentUserEmail = currentUser.Email;
    this.setState({ userEmail: currentUserEmail });
  
    // Check if the current user is a member of the "HR" group
    const group = await sp.web.currentUser.groups.get();
    const isMemberOfHR = group.some((g) => g.Title === "HR");
    this.setState({ isMemberOfHR });
  
    // Fetch categories and certificate assignments
    const categories = await this.fetchCategories();
    const certificateAssignments = await this.fetchCertificateAssignments();
    console.log("Certificate Assignments:", certificateAssignments);
    this.setState({ categories, certificateAssignments });
  }
  
  private async submitRequest(): Promise<void> {
    const { selectedCategory, selectedSubCategory } = this.state;
    if (
      !selectedCategory ||
      (!selectedSubCategory && !this.state.isOtherSubCategorySelected)
    ) {
      alert("Please select a Category and Subcategory.");
      return;
    }

    try {
      // Get the current user's properties from SharePoint
      const currentUser = await sp.web.currentUser.get();
      const currentUserEmail = currentUser.Email;

      // Query the "Employee Information" list to find the employee's information
      const employeeList = sp.web.lists.getByTitle("Employee Information");
      const employeeQuery = await employeeList.items
        .filter(`Email eq '${currentUserEmail}'`)
        .select("ID")
        .get();

      if (employeeQuery.length === 0) {
        alert("Employee not found in the Employee Information list.");
        return;
      }

      const employeeID = employeeQuery[0].ID;

      // Get the selected Category and Subcategory IDs from the "Certification" list
      const certificationList = sp.web.lists.getByTitle("Certification");
      const categoryQuery = await certificationList.items
        .filter(`Title eq '${selectedCategory}'`)
        .select("ID")
        .get();

      if (categoryQuery.length === 0) {
        alert("Selected Category not found in the Certification list.");
        return;
      }

      const categoryID = categoryQuery[0].ID;

      let subcategoryID: number | null = null;

      if (!this.state.isOtherSubCategorySelected) {
        const subcategoryQuery = await certificationList.items
          .filter(`SubCategorie eq '${selectedSubCategory}'`)
          .select("ID")
          .get();

        if (subcategoryQuery.length === 0) {
          alert("Selected Subcategory not found in the Certification list.");
          return;
        }

        subcategoryID = subcategoryQuery[0].ID;
      }

      // Create a new item in the "Certification Assignment" list
      const certificationAssignmentList = sp.web.lists.getByTitle(
        "Certificate Assignment"
      );
      await certificationAssignmentList.items.add({
        EmployeeNameId: employeeID,
        CertifNameId: categoryID,
        CertifSubCatId: subcategoryID,
        Title: "Pending",
      });

      alert("Certificate request submitted successfully.");
      this.setState({
        isAddModalOpen: false,
        selectedCategory: "",
        selectedSubCategory: "",
        isOtherCategorySelected: false,
        isOtherSubCategorySelected: false,
      });
      const certificateAssignments = await this.fetchCertificateAssignments();
      this.setState({ certificateAssignments });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(
        "An error occurred while submitting the request. Please try again."
      );
    }
  }
  private async fetchCertificateAssignments(): Promise<any[]> {
    try {
      const assignments = await sp.web.lists
        .getByTitle("Certificate Assignment")
        .items.select(
          "ID",
          "EmployeeName/Title",
          "EmployeeName/Email", 
          "CertifName/Title",
          "CertifSubCat/SubCategorie",
          "Title"
        )
        .expand("EmployeeName", "CertifName", "CertifSubCat")
        .get();
  
      return assignments;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Error fetching data from SharePoint.");
    }
  }
  

  private handleSearchInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    this.setState({ searchQuery: event.target.value });
  }

  private handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCategory = event.target.value;
    this.setState({ selectedCategory });

    if (selectedCategory === "Other") {
      this.setState({
        isOtherCategorySelected: true,
        subCategories: [], // Clear the subcategories when "Other" is selected for category
        selectedSubCategory: "", // Reset the selected subcategory
        isOtherSubCategorySelected: false, // Reset the other subcategory flag
      });
    } else {
      this.setState({ isOtherCategorySelected: false });

      if (selectedCategory) {
        const subCategories = await this.fetchSubCategories(selectedCategory);
        this.setState({ subCategories });

        if (subCategories.length === 0) {
          this.setState({
            selectedSubCategory: "",
            isOtherSubCategorySelected: false,
          });
        } else {
          this.setState({
            selectedSubCategory: subCategories[0].title,
            isOtherSubCategorySelected: false,
          });
        }
      } else {
        this.setState({ subCategories: [], selectedSubCategory: "" });
      }
    }
  };
  private handleSubCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedSubCategory = event.target.value;
    this.setState({ selectedSubCategory });

    if (selectedSubCategory === "Other") {
      this.setState({ isOtherSubCategorySelected: true });
    } else {
      this.setState({ isOtherSubCategorySelected: false });
    }
  };

  private showAddModal(): void {
    this.setState({ isAddModalOpen: true });
  }

  private hideAddModal(): void {
    this.setState({ isAddModalOpen: false });
  }

  public render(): React.ReactElement<ICertifWpProps> {
    const currentUserEmail = this.state.userEmail;
    
    const currentUserAssignments = this.state.certificateAssignments.filter(
      (assignment) => {
        if (assignment.EmployeeName && assignment.EmployeeName.Email) {
          console.log("Email of EmployeeName:", assignment.EmployeeName.Email);
          console.log("Current User Email:", currentUserEmail);
          return assignment.EmployeeName.Email === currentUserEmail;
        } else {
          console.log("EmployeeName or Email is undefined:", assignment.EmployeeName);
          return false;
        }
      }
    );
    // Filter out the requests made by other users with "approved" status
    const otherUserApprovedRequests = this.state.certificateAssignments.filter(
      (assignment) =>
        assignment.Title.toLowerCase() === "approved" &&
        assignment.EmployeeName.Email !== currentUserEmail
    );
    const { searchQuery } = this.state;

    // Filter the assignments based on the search query for current user
    const filteredCurrentUserAssignments = currentUserAssignments.filter(
      (assignment) =>
        assignment.EmployeeName.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Filter the assignments based on the search query for other users
    const filteredOtherUserAssignments = otherUserApprovedRequests.filter(
      (assignment) =>
        assignment.EmployeeName.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Concatenate both filtered lists
    const filteredAssignments = [...filteredCurrentUserAssignments, ...filteredOtherUserAssignments];
  



    return (
      <>
        <section>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  href="https://0331r.sharepoint.com/sites/HR"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-whoite dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  Home
                </a>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                    Certificate
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <br />
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-Princeton-Orange md:text-4xl dark:text-white">
                Certifications Requests
              </h2>
            </div>

            <div className="m-2 p-2">
              <button
                onClick={() => this.showAddModal()}
                className="px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
              >
                <i className="fa-solid fa-plus mr-2 text-white" />
                Request Certificate
              </button>
            </div>
          </div>
          <div className="mb-6 mt-6 ml-4">
            <div className="relative flex items-center w-full flex-wrap">
              <input
                type="search"
                className="relative m-0 block w-full max-w-[200px] flex-auto rounded-full bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                placeholder="Search Employee"
                value={this.state.searchQuery}
                onChange={(event) => this.handleSearchInputChange(event)}
                aria-describedby="button-addon2"
              />

              <span
                className="input-group-text flex items-center whitespace-nowrap rounded px-3 py-1.5 text-center text-base font-normal text-neutral-700 dark:text-neutral-200"
                id="basic-addon2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>

          {this.state.isAddModalOpen && (
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
              <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow ">
                  <button
                    onClick={this.hideAddModal}
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center "
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                  <div className="px-6 py-6 lg:px-8">
                    <h3 className="mb-4 text-xl font-medium text-gray-900 ">
                      Request a Certificate
                    </h3>
                    <div className="space-y-6">
                      <label className="block text-sm font-medium text-gray-900">
                        Categories
                      </label>
                      <div className="flex items-center">
                        {this.state.isOtherCategorySelected === false ? (
                          <select
                            className="w-full border-gray-300 rounded-lg"
                            value={this.state.selectedCategory}
                            onChange={this.handleCategoryChange}
                          >
                            <option value="">Select Category</option>
                            {this.state.categories.map((category) => (
                              <option
                                key={category.title}
                                value={category.title}
                              >
                                {category.title}
                              </option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <div className="flex items-center w-full">
                            <input
                              type="text"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Please enter your option"
                              onChange={(event) =>
                                this.setState({
                                  selectedCategory: event.target.value,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                this.setState({
                                  isOtherCategorySelected: false,
                                  selectedCategory: "",
                                })
                              }
                              className="text-gray-900 w-10"
                            >
                              <i className="fa-solid fa-rotate-left" />
                            </button>
                          </div>
                        )}
                      </div>

                      <label className="block text-sm font-medium text-gray-900">
                        Subcategories
                      </label>
                      <div className="flex items-center">
                        {this.state.isOtherSubCategorySelected === false ? (
                          <select
                            className="w-full border-gray-300 rounded-lg"
                            value={this.state.selectedSubCategory}
                            onChange={this.handleSubCategoryChange}
                          >
                            <option value="">Select Subcategory</option>
                            {this.state.subCategories.map((subCategory) => (
                              <option
                                key={subCategory.title}
                                value={subCategory.title}
                              >
                                {subCategory.title}
                              </option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <div className="flex items-center w-full">
                            <input
                              type="text"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Enter your subcategory"
                              onChange={(event) =>
                                this.setState({
                                  selectedSubCategory: event.target.value,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                this.setState({
                                  isOtherSubCategorySelected: false,
                                  selectedSubCategory: "",
                                })
                              }
                              className="text-gray-900 w-10"
                            >
                              <i className="fa-solid fa-rotate-left" />
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => this.submitRequest()}
                        className="w-full duration-300 text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-semibold hover:text-base hover:shadow-lg"
                      >
                        Submit Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        <section>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Employee Name</th>
                  <th className="px-6 py-3">Certification Name</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.ID}>
                  <td className="px-6 py-3">
                    {assignment.EmployeeName.Title}
                  </td>
                  <td className="px-6 py-3">
                    <div className="pl-3">
                      <div className="text-base font-semibold">
                        {assignment.CertifName.Title}
                      </div>
                      <div className="font-normal text-gray-500">
                        {assignment.CertifSubCat.SubCategorie}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {this.getStatusLabel(assignment.Title)}
                  </td>
                </tr>
              ))}
                
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }
}
