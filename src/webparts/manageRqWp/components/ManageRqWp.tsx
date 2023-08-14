import * as React from "react";
import "./../../../tailwind.css";
import { IManageRqWpProps } from "./IManageRqWpProps";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

require("@fortawesome/fontawesome-free/css/all.min.css");
export interface ISubCategory {
  title: string;
}
export interface ICategory {
  title: string;
}

export interface State {
  holdlist: any[];
  isModalOpen: boolean;
  selectedCategory: string;
  selectedSubCategory: string;
  isOtherCategorySelected: boolean;
  isOtherSubCategorySelected: boolean;
  categories: ICategory[];
  subCategories: ISubCategory[];
  showRequired: boolean;
  RequestedCategoryId: number;
  RequestedSubCategoryId: number;
  RQEmail: number;
  CertifID: number;
}

export default class ManageRqWp extends React.Component<
  IManageRqWpProps,
  State
> {
  constructor(props: IManageRqWpProps) {
    super(props);
    this.state = {
      holdlist: [],
      isModalOpen: false,
      selectedCategory: "",
      selectedSubCategory: "",
      isOtherCategorySelected: false,
      isOtherSubCategorySelected: false,
      categories: [],
      subCategories: [],
      showRequired: false,
      RequestedCategoryId: 0,
      RequestedSubCategoryId: 0,
      RQEmail: 0,
      CertifID: 0,
    };
  }
  toggleModal = () => {
    this.setState({ isModalOpen: true });
  };
  private handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCategory = event.target.value;
    this.setState({ selectedCategory });

    if (selectedCategory) {
      const subCategories = await this.fetchSubCategories(selectedCategory);
      this.setState({ subCategories });
    }
  };
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

  private handleSubCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedSubCategory = event.target.value;
    this.setState({ selectedSubCategory });
  };
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

  public async componentDidMount(): Promise<void> {
    sp.setup({
      sp: {
        baseUrl: "https://0331r.sharepoint.com/sites/HR",
      },
    });
    const categories = await this.fetchCategories();
    this.setState({ categories });

    const Onholdlist = await sp.web.lists
      .getByTitle("Certification Assignment")
      .items.filter(`Status eq 'On Hold'`)
      .select(
        "ID",
        "Title",
        "EmployeeName/Title",
        "EmployeeName/Email",
        "EmployeeName/ID",
        "CertifName/ID",
        "CertifName/Title",
        "CertifSubCat/SubCategorie",
        "Status"
      )
      .expand("EmployeeName", "CertifName", "CertifSubCat")
      .getAll();

    this.setState({ holdlist: Onholdlist });
  }
  private showModal = async (Certifid: number) => {
    try {
      const selectedItem = this.state.holdlist.find(
        (item) => item.ID === Certifid
      );

      if (selectedItem) {
        this.setState({
          CertifID: selectedItem.ID,
          RequestedCategoryId: selectedItem.CertifName.ID,
          RQEmail: selectedItem.EmployeeName.ID,
          isModalOpen: true,
        });
      }
    } catch (error) {
      console.error("Error showing modal:", error);
    }
  };

  private submitResponse = async () => {
    const {
      selectedCategory,
      selectedSubCategory,
      RequestedCategoryId,
      RQEmail,
      CertifID,
    } = this.state;

    if (!selectedCategory || !selectedSubCategory) {
      this.setState({ showRequired: true });
      return;
    }

    const PrerequisitList = sp.web.lists.getByTitle(
      "Prerequisite Certifications"
    );

    await PrerequisitList.items.add({
      CertifAssignmentID: CertifID,
      Title: selectedCategory,
      SubCat: selectedSubCategory,
      RQCertId: RequestedCategoryId,
      RQEmailId: RQEmail,
    });
    await sp.web.lists
      .getByTitle("Certification Assignment")
      .items.getById(CertifID)
      .update({
        Title: "Suggested",
      });
  };
  public render(): React.ReactElement<IManageRqWpProps> {
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
                  <a
                    href="https://0331r.sharepoint.com/sites/HR/SitePages/Certifications.aspx"
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-whoite dark:hover:text-white"
                  >
                    Certifications
                  </a>
                </div>
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
                    Manage Certification
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </section>
        <br />
        <br />
        <div className="w-full mx-auto sm:px-6 lg:px-8">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-Princeton-Orange md:text-4xl dark:text-white flex-shrink-0">
              Manage On Hold Requests
            </h2>
          </div>
          {this.state.isModalOpen && (
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
              <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow ">
                  <button
                    onClick={() => this.setState({ isModalOpen: false })}
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
                      Suggest Prerequisite Certification
                    </h3>
                    <div className="space-y-6">
                      <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          Categories
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-lg p-2 text-center"
                          value={this.state.selectedCategory}
                          onChange={this.handleCategoryChange}
                        >
                          <option value="">Select Category</option>
                          {this.state.categories.map((category) => (
                            <option key={category.title} value={category.title}>
                              {category.title}
                            </option>
                          ))}
                        </select>

                        <label className="block text-sm font-medium text-gray-900 mt-4 mb-4">
                          Subcategories
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-lg p-2 mb-6 text-center"
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
                        </select>
                      </div>
                    </div>
                    {this.state.showRequired && (
                      <>
                        <div className="text-red-500 text-sm">
                          Please fill all required fields
                        </div>
                        <br />
                      </>
                    )}
                    <button
                      onClick={this.submitResponse}
                      className="w-full duration-300 text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-semibold hover:text-base hover:shadow-lg"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <br />
          <br />
          <div className="container mx-auto px-4 sm:px-8 mt-5">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Employee Name</th>
                    <th className="px-6 py-3">Certification Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                  {this.state.holdlist.map((item, index) => (
                    <tr key={item.ID}>
                      <td className="px-6 py-3">{item.EmployeeName?.Title}</td>
                      <td className="px-6 py-3">
                        <div className="pl-3">
                          <div className="text-base font-semibold">
                            {item.CertifName?.Title}
                          </div>
                          <div className="font-normal text-gray-500">
                            {item.CertifSubCat?.SubCategorie}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="bg-Deep-Peach text-Princeton-Orange text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                          {item.Status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {item.Title === "Suggested" ? (
                          <span className="text-green-500 font-medium">
                            Suggested
                          </span>
                        ) : (
                          <button onClick={() => this.showModal(item.ID)}>
                            Suggest{" "}
                            <i className="fa-regular fa-lightbulb fa-lg" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }
}
