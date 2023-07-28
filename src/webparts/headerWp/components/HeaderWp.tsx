import * as React from "react";
import { IHeaderWpProps } from "./IHeaderWpProps";
import "./../../../tailwind.css";
import {sp} from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";



require("@fortawesome/fontawesome-free/css/all.min.css");

export interface State {
  
}

export default class HeaderWp extends React.Component<IHeaderWpProps, State> {

 //Create Item
 public componentDidMount(): void {
  sp.setup({
    spfxContext: this.context,
    sp: {
      baseUrl: "https://0331r.sharepoint.com/sites/HR",
    },
  });
}

  
  public render(): React.ReactElement<IHeaderWpProps> {
    return (
      <h1>Header</h1>
    );
  }

  
}
