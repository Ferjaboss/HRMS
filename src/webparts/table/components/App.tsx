//importing Modules 
import * as React from 'react';
import { ITableProps } from './ITableProps';
import './../../../tailwind.css';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
// import styles from './Table.module.scss';
// import { escape } from '@microsoft/sp-lodash-subset';
require('@fortawesome/fontawesome-free/css/all.min.css');



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
  selectedItem: Employee | null ;
}


export default class App extends React.Component<ITableProps, State> {
  Name = React.createRef<HTMLInputElement>();
  Email = React.createRef<HTMLInputElement>();
  Position = React.createRef<HTMLInputElement>();
  PhoneNumber = React.createRef<HTMLInputElement>();
  //Constructor to initialize the state
  constructor(props: ITableProps) {
    super(props);
    this.state = {
    listItems: [],
    isDeleteModalOpen: false,
    isEditModalOpen: false,
    selectedItemId: 0,
    selectedItem: null,
    };
    this.hideModal = this.hideModal.bind(this);
    this.hideEditModal = this.hideEditModal.bind(this);
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
    const selectedEmployee: Employee = await sp.web.lists.getByTitle('Employee Information').items.getById(itemId).get();

    // Check if the employee with the specified ID exists
    if (selectedEmployee) {
      this.setState({
        isEditModalOpen: true,
        selectedItemId: itemId,
        selectedItem: selectedEmployee,
      });
    } else {
      console.error('Employee not found with the specified ID.');
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
}

//function to hide the Edit modal
private hideEditModal(): void {
  this.setState({ isEditModalOpen: false, selectedItem: null });
}
// Update Function
private async updateEmployee(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const name = this.Name.current!.value;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const email = this.Email.current!.value;
  const position = this.Position.current!.value;
  const phoneNumber = this.PhoneNumber.current!.value;

  const updatedEmployee: Employee = {
    Title: name,
    Email: email,
    Position: position,
    PhoneNumber: phoneNumber,
    Id: this.state.selectedItemId, 
  };
  try {
    await sp.web.lists.getByTitle('Employee Information').items.getById(this.state.selectedItemId).update(updatedEmployee);
    console.log('Employee updated successfully.');
    this.hideEditModal();
    this.refreshList();
  } catch (error) {
    console.error('Error updating employee:', error);
    console.error('Full error details:', error.data);
  }
}
// Delete Function 
private deleteItem(itemId: number): void {
  sp.web.lists.getByTitle('Employee Information').items.getById(itemId).delete()
    .then(() => {
      this.hideModal();
      this.refreshList();
    })
    .catch((error) => {
      console.error("Error deleting item:", error);
      console.error("Full error details:", error.data);
    });
}
  // Refresh Function to refresh the list after modifying it
private refreshList(): void {
  sp.web.lists.getByTitle('Employee Information').items.get()
    .then((data: Employee[]) => {
      this.setState({ listItems: data });
    })
    .catch((error) => {
      console.error("Error fetching data from SharePoint:", error);
      console.error("Full error details:", error.data);
    });
}
public componentDidMount(): void {
  sp.setup({
    sp: {
      baseUrl: "https://0331r.sharepoint.com/sites/HR",
    },
  });

  sp.web.lists.getByTitle('Employee Information').items.get()
    .then((data: Employee[]) => {
      console.log("Fetched data from SharePoint:", data);
      this.setState({ listItems: data });
    })
    .catch((error) => {
      console.error("Error fetching data from SharePoint:", error);
      console.error("Full error details:", error.data);
    });
}
public render(): React.ReactElement<ITableProps> {
    return (
<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Name 
                </th>
                <th scope="col" className="px-6 py-3">
                    Position
                </th>
                <th scope="col" className="px-6 py-3">
                    Phone Number
                </th>
                <th scope="col" className="px-6 py-3">
                    Action
                </th>
            </tr>
        </thead>
        <tbody>
  {this.state.listItems.map((employee,item) => (
    <tr key={item} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
        <div className="pl-3">
          <div className="text-base font-semibold">{employee.Title}</div>
          <div className="font-normal text-gray-500">{employee.Email}</div>
        </div>
      </th>
      <td className="px-6 py-4">{employee.Position}</td>
      <td className="px-6 py-4">{employee.PhoneNumber}</td>
      <td className="px-6 py-4">
        <button onClick={() => this.showEditModal(employee.Id)}>
          <i className="fa-solid fa-pen-to-square fa-lg text-Metallic-Blue"/>
        </button>
        <button onClick={() => this.showModal(employee.Id)}  className="ml-2">
          <i className="fa-solid fa-trash fa-lg text-Princeton-Orange" />
        </button>
      </td>
    </tr>
  ))}
</tbody>
    </table>
    {this.state.isDeleteModalOpen && (
  <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
    <div className="relative w-full max-w-md max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <button onClick={this.hideModal} className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
        <div className="p-6 text-center">
          <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this Employee?</h3>
          <button onClick={() => this.deleteItem(this.state.selectedItemId)} className="text-white bg-Sandy-Brown hover:bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
            Yes, I&apos;m sure
          </button>
          <button onClick={this.hideModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
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
              className="w-full text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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
    );
  }
}