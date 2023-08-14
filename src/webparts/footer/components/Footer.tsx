import * as React from 'react';
import "./../../../tailwind.css";
import { IFooterProps } from './IFooterProps';
require("@fortawesome/fontawesome-free/css/all.min.css");

export default class Footer extends React.Component<IFooterProps, {}> {
  public render(): React.ReactElement<IFooterProps> {
   

    return (
      <div className='relative'>
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: 'url(https://alight.eu/wp-content/uploads/2023/04/Alight-Weltkarte-keine-Grenzen.svg)' }}
      />
      <div className='relative z-10 bg-Jet bg-opacity-80 min-h-max flex flex-col items-center justify-center' style={{ minHeight: '400px' }}>
        <div className='flex items-center'>
          <span className='bg-white h-px w-64 mr-5' />
          <img
            src='https://alight.eu/wp-content/uploads/2022/09/Asset-28.svg'
            alt='alight'
            className='w-32 relative z-10 self-stretch'
            loading='lazy'
          />
          <span className='bg-white h-px  ml-5 w-64' />
        </div>
        <div className='absolute bottom-0 flex items-center text-white'>
            <span className='mr-2'>&copy; 2023 All rights reserved</span>
            <i className='fas fa-registered'></i>
          </div>
      </div>
    </div>
    );
  }
}
