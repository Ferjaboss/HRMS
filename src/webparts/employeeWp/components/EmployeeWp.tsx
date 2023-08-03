//importing Modules
import * as React from "react";
import { IEmployeeWpProps } from "./IEmployeeWpProps";
import "./../../../tailwind.css";
import { sp } from "@pnp/sp/presets/all";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

require("@fortawesome/fontawesome-free/css/all.min.css");

export interface Employee {
  Title: string;
  Email: string;
  PhoneNumber: string;
  Position: string;
  Id: number;
}

export interface State {
  listItems: Employee[];
  isDeleteModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedItemId: number;
  // eslint-disable-next-line @rushstack/no-new-null
  selectedItem: Employee | null;
  sortByNameAsc: boolean;
  sortByPositionAsc: boolean;
  sortByPhoneNumberAsc: boolean;
  isMemberOfHR: boolean;
  isAddModalOpen: boolean;
  searchQuery: string;
}

export default class App extends React.Component<IEmployeeWpProps, State> {
  Name = React.createRef<HTMLInputElement>();
  Email = React.createRef<HTMLInputElement>();
  Position = React.createRef<HTMLInputElement>();
  PhoneNumber = React.createRef<HTMLInputElement>();
  //Constructor to initialize the state
  constructor(props: IEmployeeWpProps) {
    super(props);
    this.state = {
      listItems: [],
      isDeleteModalOpen: false,
      isEditModalOpen: false,
      selectedItemId: 0,
      selectedItem: null,
      sortByNameAsc: true,
      sortByPositionAsc: true,
      sortByPhoneNumberAsc: true,
      isMemberOfHR: false,
      isAddModalOpen: false,
      searchQuery: "",
    };
    this.hideAddModal = this.hideAddModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.hideEditModal = this.hideEditModal.bind(this);
  }

  public async componentDidMount(): Promise<void> {
    sp.setup({
      sp: {
        baseUrl: "https://0331r.sharepoint.com/sites/HR",
      },
    });

    sp.web.lists
      .getByTitle("Employee Information")
      .items.get()
      .then((data: Employee[]) => {
        this.setState({ listItems: data });
      })
      .catch((error) => {
        console.error("Error fetching data from SharePoint:", error);
        console.error("Full error details:", error.data);
      });
    const group = await sp.web.currentUser.groups.get();
    const condi = group.filter((g) => g.Title === "HR").length > 0;
    if (condi) {
      this.setState({ isMemberOfHR: true });
    }
  }
  private handleSearchInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    this.setState({ searchQuery: event.target.value });
  }

  //

  //

  //

  //

  //

  // Function to show and hide the modals

  private showAddModal(): void {
    this.setState({ isAddModalOpen: true });
  }

  private hideAddModal(): void {
    this.setState({ isAddModalOpen: false });
  }
  // Function to show the Delete modal
  private showModal(itemId: number): void {
    this.setState({ isDeleteModalOpen: true, selectedItemId: itemId });
  }
  // Function to hide the Delete modal
  private hideModal(): void {
    this.setState({ isDeleteModalOpen: false });
  }
  //function to show the Edit modal
  private async showEditModal(itemId: number): Promise<void> {
    try {
      // Fetch the employee item with the specified ID from SharePoint
      const selectedEmployee: Employee = await sp.web.lists
        .getByTitle("Employee Information")
        .items.getById(itemId)
        .get();

      // Check if the employee with the specified ID exists
      if (selectedEmployee) {
        this.setState({
          isEditModalOpen: true,
          selectedItemId: itemId,
          selectedItem: selectedEmployee,
        });
      } else {
        console.error("Employee not found with the specified ID.");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  }

  //function to hide the Edit modal
  private hideEditModal(): void {
    this.setState({ isEditModalOpen: false, selectedItem: null });
  }

  //

  //

  //

  //

  //

  //Sorting Functions

  private sortByName(): void {
    const { listItems, sortByNameAsc } = this.state;
    const sortedListItems = listItems.sort((a, b) =>
      sortByNameAsc
        ? a.Title.localeCompare(b.Title)
        : b.Title.localeCompare(a.Title)
    );
    this.setState({
      listItems: sortedListItems,
      sortByNameAsc: !sortByNameAsc,
    });
  }

  private sortByPosition(): void {
    const { listItems, sortByPositionAsc } = this.state;
    const sortedListItems = listItems.sort((a, b) =>
      sortByPositionAsc
        ? a.Position.localeCompare(b.Position)
        : b.Position.localeCompare(a.Position)
    );
    this.setState({
      listItems: sortedListItems,
      sortByPositionAsc: !sortByPositionAsc,
    });
  }

  private sortByPhoneNumber(): void {
    const { listItems, sortByPhoneNumberAsc } = this.state;
    const sortedListItems = listItems.sort((a, b) =>
      sortByPhoneNumberAsc
        ? a.PhoneNumber.localeCompare(b.PhoneNumber)
        : b.PhoneNumber.localeCompare(a.PhoneNumber)
    );
    this.setState({
      listItems: sortedListItems,
      sortByPhoneNumberAsc: !sortByPhoneNumberAsc,
    });
  }

  //

  //

  //

  //

  //
  // Refresh Function to refresh the list after modifying it
  private refreshList(): void {
    sp.web.lists
      .getByTitle("Employee Information")
      .items.get()
      .then((data: Employee[]) => {
        this.setState({ listItems: data });
      })
      .catch((error) => {
        console.error("Error fetching data from SharePoint:", error);
        console.error("Full error details:", error.data);
      });
  }
  //

  //

  //

  //

  //
  //CRUD
  // Create Function

  private async createItem(): Promise<void> {
    const name = this.Name.current?.value;
    const email = this.Email.current?.value;
    const position = this.Position.current?.value;
    const phoneNumber = this.PhoneNumber.current?.value;

    await sp.web.lists.getByTitle("Employee Information").items.add({
      Title: name,
      Email: email,
      Position: position,
      PhoneNumber: phoneNumber,
    });
    this.hideAddModal();
    this.refreshList();
  }

  // Update Function
  private async updateEmployee(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const name = this.Name.current!.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const email = this.Email.current!.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const position = this.Position.current!.value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const phoneNumber = this.PhoneNumber.current!.value;

    const updatedEmployee: Employee = {
      Title: name,
      Email: email,
      Position: position,
      PhoneNumber: phoneNumber,
      Id: this.state.selectedItemId,
    };
    try {
      await sp.web.lists
        .getByTitle("Employee Information")
        .items.getById(this.state.selectedItemId)
        .update(updatedEmployee);
      console.log("Employee updated successfully.");
      this.hideEditModal();
      this.refreshList();
    } catch (error) {
      console.error("Error updating employee:", error);
      console.error("Full error details:", error.data);
    }
  }

  // Delete Function
  private deleteItem(itemId: number): void {
    sp.web.lists
      .getByTitle("Employee Information")
      .items.getById(itemId)
      .delete()
      .then(() => {
        this.hideModal();
        this.refreshList();
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        console.error("Full error details:", error.data);
      });
  }

  public render(): React.ReactElement<IEmployeeWpProps> {
    const filteredListItems = this.state.listItems.filter((employee) =>
      employee.Title.toLowerCase().includes(
        this.state.searchQuery.toLowerCase()
      )
    );
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
                    Employee
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <br />
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-Princeton-Orange md:text-4xl dark:text-white">
                Employee List
              </h2>
            </div>
            {this.state.isMemberOfHR && (
              <div className="m-2 p-2">
                <button
                  onClick={() => this.showAddModal()}
                  className="px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
                >
                  <i className="fa-solid fa-plus mr-2 text-white" />
                  New Employee
                </button>
              </div>
            )}
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
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  <button
                    onClick={this.hideAddModal}
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                    <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                      Add an employee
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Employee Name
                        </label>
                        <input
                          ref={this.Name}
                          id="name"
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Email
                        </label>
                        <input
                          ref={this.Email}
                          type="email"
                          id="email"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Position
                        </label>
                        <input
                          ref={this.Position}
                          id="position"
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="Software Engineer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Phone Number
                        </label>
                        <input
                          ref={this.PhoneNumber}
                          id="phoneNumber"
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="123-456-7890"
                          required
                        />
                      </div>
                      <button
                        className="w-full duration-300 text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-semibold hover:text-base hover:shadow-lg"
                        onClick={() => this.createItem()}
                      >
                        Add Employee
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
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      Name
                      <button onClick={() => this.sortByName()}>
                        <svg
                          className="w-3 h-3 ml-1.5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      Position
                      <button onClick={() => this.sortByPosition()}>
                        <svg
                          className="w-3 h-3 ml-1.5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <div className="flex items-center">
                      Phone Number
                      <button onClick={() => this.sortByPhoneNumber()}>
                        <svg
                          className="w-3 h-3 ml-1.5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                        </svg>
                      </button>
                    </div>
                  </th>
                  {this.state.isMemberOfHR && (
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredListItems.map((employee, item) => (
                  <tr
                    key={item}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="pl-3">
                        <div className="text-base font-semibold">
                          {employee.Title}
                        </div>
                        <div className="font-normal text-gray-500">
                          {employee.Email}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">{employee.Position}</td>
                    <td className="px-6 py-4">{employee.PhoneNumber}</td>
                    {this.state.isMemberOfHR && (
                      <td className="px-6 py-4">
                        <button onClick={() => this.showEditModal(employee.Id)}>
                          <i className="fa-solid fa-pen-to-square fa-lg text-Metallic-Blue" />
                        </button>
                        <button
                          onClick={() => this.showModal(employee.Id)}
                          className="ml-2"
                        >
                          <i className="fa-solid fa-trash fa-lg text-Princeton-Orange" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {this.state.isDeleteModalOpen && (
              <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
                <div className="relative w-full max-w-md max-h-full">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                      onClick={this.hideModal}
                      className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      data-modal-hide="popup-modal"
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
                          strokeWidth="2"
                          d="M1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-6 text-center">
                      <svg
                        className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this Employee?
                      </h3>
                      <button
                        onClick={() =>
                          this.deleteItem(this.state.selectedItemId)
                        }
                        className="text-white duration-300 hover:font-semibold hover:text-base hover:shadow-lg bg-Sandy-Brown hover:bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                      >
                        Yes, I&apos;m sure
                      </button>
                      <button
                        onClick={this.hideModal}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                      >
                        No, cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {this.state.isEditModalOpen && (
              <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
                <div className="relative w-full max-w-md max-h-full">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                      onClick={this.hideEditModal}
                      className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                          d="M1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <div className="px-6 py-6 lg:px-8">
                      <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                        Edit Employee
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Employee Name
                          </label>
                          <input
                            ref={this.Name}
                            type="text"
                            defaultValue={this.state.selectedItem?.Title ?? ""}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Email
                          </label>
                          <input
                            ref={this.Email}
                            type="email"
                            defaultValue={this.state.selectedItem?.Email}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Position
                          </label>
                          <input
                            ref={this.Position}
                            type="text"
                            defaultValue={this.state.selectedItem?.Position}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Phone Number
                          </label>
                          <input
                            ref={this.PhoneNumber}
                            type="text"
                            defaultValue={this.state.selectedItem?.PhoneNumber}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            required
                          />
                        </div>
                        <button
                          className="w-full duration-300 text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-semibold hover:text-base hover:shadow-lg"
                          onClick={() => this.updateEmployee()}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }
}
