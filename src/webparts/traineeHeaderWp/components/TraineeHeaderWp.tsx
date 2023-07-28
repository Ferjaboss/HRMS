import * as React from "react";
import { ITraineeHeaderWpProps } from "./ITraineeHeaderWpProps";
import "./../../../tailwind.css";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "./TraineeHeaderWp.module.scss";
import CustomizableSelect from "./CustomizableSelect";
import InputText from "./InputText";

require("@fortawesome/fontawesome-free/css/all.min.css");

export interface State {
  isModalOpen: boolean;
}

export default class HeaderWp extends React.Component<
  ITraineeHeaderWpProps,
  State
> {
  constructor(props: ITraineeHeaderWpProps) {
    super(props);
    this.state = {
      isModalOpen: false,
    };
    this.hideModal = this.hideModal.bind(this);
  }

  private showModal(): void {
    this.setState({ isModalOpen: true });
  }

  private hideModal(): void {
    this.setState({ isModalOpen: false });
  }

  //Create Item
  public componentDidMount(): void {
    sp.setup({
      spfxContext: this.context,
      sp: {
        baseUrl: "https://0331r.sharepoint.com/sites/HR",
      },
    });
  }

  public render(): React.ReactElement<ITraineeHeaderWpProps> {
    return (
      <section>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="https://0331r.sharepoint.com/sites/HR"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 ">
                  Certificate
                </span>
              </div>
            </li>
          </ol>
        </nav>
        <br />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-Princeton-Orange md:text-4xl ">
              Certificate
            </h2>
          </div>
          <div className="m-2 p-2">
            <button
              onClick={() => this.showModal()}
              className="px-4 py-2 bg-Metallic-Blue hover:bg-Shadow-Blue rounded-lg text-white"
            >
              <i className="fa-regular fa-file mr-2" />
              Request a Certificate
            </button>
          </div>
        </div>
        {this.state.isModalOpen && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-opacity-80 bg-gray-800">
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow ">
                <button
                  onClick={this.hideModal}
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
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Categories
                    </label>
                    <CustomizableSelect />

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 ">
                        Email
                      </label>
                      <InputText
                        type="email"
                        id="email"
                        placeholder="name@company.com"
                      />
                    </div>
                    <button className="w-full duration-300 text-white bg-Princeton-Orange focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:font-semibold hover:text-base hover:shadow-lg">
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}
