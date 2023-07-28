import * as React from 'react';
import './../../../tailwind.css';
interface InputTextProps {
    type: string;
    id: string;
    placeholder: string;
  }
  const InputText: React.FC<InputTextProps> = ({ type, id, placeholder }) => {
    return (
      <input
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 *'
        placeholder={placeholder}
        required
        type={type}
        id={id}
      />
    );
  };
  
  export default InputText;