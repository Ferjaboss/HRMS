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
  pendingItemCount: number;
  showAlert: boolean;
  showRequired : boolean;
  customCategory: string;
  customSubCategory: string;
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
      pendingItemCount: 0,
      showAlert: false,
      showRequired : false,
      customCategory: "",
      customSubCategory: "",
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
    switch (status) {
      case "Rejected":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            Declined
          </span>
        );
      case "Approved":
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

    // Fetch categories and certification assignments
    const categories = await this.fetchCategories();
    const certificateAssignments = await this.fetchCertificateAssignments();
    this.setState({ categories, certificateAssignments });
    const certificationAssignmentList = sp.web.lists.getByTitle(
      "Certification Assignment"
    );
    const pendingItems = await certificationAssignmentList.items
      .filter(`Status eq 'Pending'`)
      .get();
    const pendingItemCount = pendingItems.length;
    this.setState({ pendingItemCount });
  }

  private async submitRequest(): Promise<void> {
    const {
      selectedCategory,
      selectedSubCategory,
      isOtherCategorySelected,
      isOtherSubCategorySelected,
      customCategory,
      customSubCategory,
    } = this.state;
    
    // Check if the user selected options from the select menus (not "Other" option)
    const isCategorySelected = selectedCategory && !isOtherCategorySelected;
    const isSubCategorySelected = selectedSubCategory && !isOtherSubCategorySelected;
  
    try {
      const currentUser = await sp.web.currentUser.get();
      const currentUserEmail = currentUser.Email;
      const employeeList = sp.web.lists.getByTitle("Employee Information");
      const employeeQuery = await employeeList.items
        .filter(`Email eq '${currentUserEmail}'`)
        .select("ID")
        .get();
  
      const employeeID = employeeQuery.length > 0 ? employeeQuery[0].ID : null;
  
      // If the user selected options from both select menus, add to "Certification Assignment" list
      if (isCategorySelected && isSubCategorySelected) {
        const certificationList = sp.web.lists.getByTitle("Certification");
        const categoryQuery = await certificationList.items
          .filter(`Title eq '${selectedCategory}'`)
          .select("ID")
          .get();
        const subcategoryQuery = await certificationList.items
          .filter(`SubCategorie eq '${selectedSubCategory}'`)
          .select("ID")
          .get();
  
        const categoryID = categoryQuery.length > 0 ? categoryQuery[0].ID : null;
        const subcategoryID = subcategoryQuery.length > 0 ? subcategoryQuery[0].ID : null;
  
        if (!categoryID || !subcategoryID) {
          this.setState({ showRequired: true });
          return;
        }
  
        // Create a new item in the "Certification Assignment" list
        const certificationAssignmentList = sp.web.lists.getByTitle("Certification Assignment");
        await certificationAssignmentList.items.add({
          EmployeeNameId: employeeID,
          CertifNameId: categoryID,
          CertifSubCatId: subcategoryID,
          Status: "Pending",
        });
      }
  
      // If the user selected "Other" for either category or subcategory, add to "Suggested Certifications" list
      if (isOtherCategorySelected || isOtherSubCategorySelected) {
        const suggestedCertificationsList = sp.web.lists.getByTitle("SuggCert");
        const suggestedCategory = isOtherCategorySelected ? customCategory : selectedCategory;
        const suggestedSubcategory = isOtherSubCategorySelected ? customSubCategory : selectedSubCategory;
  
        if (suggestedCategory || suggestedSubcategory) {
          await suggestedCertificationsList.items.add({
            Title: suggestedCategory,
            SubCategorie: suggestedSubcategory,
            EmployeeEmail: currentUserEmail,
          });
        }
      }
  
      
  
      setTimeout(() => {
        this.setState({
          showAlert: false,
        });
      }, 5000);
  
      const certificateAssignments = await this.fetchCertificateAssignments();
      this.setState({ certificateAssignments });
    } catch (error) {
      console.error("Error submitting request:", error);
    }
    const isFormValid =
    (isCategorySelected && isSubCategorySelected) ||
    (isOtherCategorySelected && customCategory) ||
    (isOtherSubCategorySelected && customSubCategory);

  if (!isFormValid) {
    this.setState({ showRequired: true ,
    isAddModalOpen: true,
    showAlert: false,});
  
    return;
  }
  this.setState({
    isAddModalOpen: false,
    selectedCategory: "",
    selectedSubCategory: "",
    isOtherCategorySelected: false,
    isOtherSubCategorySelected: false,
    showAlert: true,
    showRequired : false,
  });
  }
  
  private async fetchCertificateAssignments(): Promise<any[]> {
    try {
      const assignments = await sp.web.lists
        .getByTitle("Certification Assignment")
        .items.select(
          "ID",
          "EmployeeName/Title",
          "EmployeeName/Email",
          "CertifName/Title",
          "CertifSubCat/SubCategorie",
          "Status"
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

  private handleCategoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = event.target.value;
    this.setState({ selectedCategory });
  
    if (selectedCategory === "Other") {
      this.setState({
        customSubCategory: "",
        isOtherCategorySelected: true,
        isOtherSubCategorySelected: true,
      });
    } else {
      this.setState({ isOtherCategorySelected: false, isOtherSubCategorySelected: false });
  
      if (selectedCategory) {
        const subCategories = await this.fetchSubCategories(selectedCategory);
        this.setState({ subCategories });
      } 
    }
  };
  
  private handleSubCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubCategory = event.target.value;
  
    if (selectedSubCategory === "Other") {
      this.setState({
        selectedSubCategory: "other",
        isOtherSubCategorySelected: true,
      });
    } else {
      this.setState({
        selectedSubCategory,
        isOtherSubCategorySelected: false,
      });
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
          return assignment.EmployeeName.Email === currentUserEmail;
        } else {
          return false;
        }
      }
    );
    // Filter out the requests made by other users with "approved" status
    const otherUserApprovedRequests = this.state.certificateAssignments.filter(
      (assignment) =>
        assignment.Status == "Approved" &&
        assignment.EmployeeName.Email !== currentUserEmail
    );
    const { searchQuery } = this.state;

    // Filter the assignments based on the search query for current user
    const filteredCurrentUserAssignments = currentUserAssignments.filter(
      (assignment) =>
        assignment.EmployeeName.Title.toLowerCase().includes(
          searchQuery.toLowerCase()
        )
    );

    // Filter the assignments based on the search query for other users
    const filteredOtherUserAssignments = otherUserApprovedRequests.filter(
      (assignment) =>
        assignment.EmployeeName.Title.toLowerCase().includes(
          searchQuery.toLowerCase()
        )
    );

    // Concatenate both filtered lists
    const filteredAssignments = [
      ...filteredCurrentUserAssignments,
      ...filteredOtherUserAssignments,
    ];

    return (
      <>
        {this.state.showAlert && (
          <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
            <svg
              className="flex-shrink-0 w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div className="ml-3 text-sm font-medium">
              Your Request Has been Submitted Successfully and will be reviewed
              by HR.
            </div>
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
              data-dismiss-target="#alert-3"
              aria-label="Close"
              onClick={() => this.setState({ showAlert: false })}
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          </div>
        )}
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
          <div className="w-full mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-Princeton-Orange md:text-4xl dark:text-white flex-shrink-0">
                Certifications Requests
              </h2>
            </div>
            <div className="flex items-center">
              {this.state.isMemberOfHR ? (
                <div className="flex flex-col items-end">
                  <a
                    href="https://outlook.office365.com/"
                    className="relative w-full mb-2 flex justify-center items-center px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
                  >
                    Manage Requests
                    {this.state.pendingItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full dark:border-gray-900">
                        {this.state.pendingItemCount}
                      </span>
                    )}
                  </a>
                  <button
                    onClick={() => this.showAddModal()}
                    className="w-full px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
                  >
                    <i className="fa-solid fa-plus mr-2 text-white" />
                    Request Certificate
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => this.showAddModal()}
                  className="px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
                >
                  <i className="fa-solid fa-plus mr-2 text-white" />
                  Request Certificate
                </button>
              )}
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
        value={this.state.customCategory}
        onChange={(event) =>
          this.setState({
            customCategory: event.target.value,
          })
        }
                            />
                            
                            <button
                              onClick={() =>
                                this.setState({
                                  isOtherCategorySelected: false,
                                  selectedCategory: "",
                                  customCategory: "",
                                  customSubCategory: "",
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
        value={this.state.customSubCategory}
        onChange={(event) =>
          this.setState({
            customSubCategory: event.target.value,
          })
        }
                            />
                            <button
                              onClick={() =>
                                this.setState({
                                  isOtherSubCategorySelected: false,
                                  selectedSubCategory: "",
                                  customSubCategory: "",
                                })
                              }
                              className="text-gray-900 w-10"
                            >
                              <i className="fa-solid fa-rotate-left" />
                            </button>
                          </div>
                        )}
                      </div>
                      {this.state.showRequired &&(
                        <div className="text-red-500 text-sm">
                          Please fill all required fields
                        </div>
                      )}
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
                      {this.getStatusLabel(assignment.Status)}
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
