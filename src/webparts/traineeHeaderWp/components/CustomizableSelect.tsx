import * as React from 'react';
import { useState, ChangeEvent } from 'react';
import './../../../tailwind.css';


const CustomizableSelect = () => {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [customOption, setCustomOption] = useState<string>('');
  
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedOption(event.target.value);
    };
  
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setCustomOption(event.target.value);
    };
  
    return (
      <div >
        {selectedOption !== 'custom' ? (
        <select className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' value={selectedOption} onChange={handleSelectChange}>
          <option value="">Select an option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
          <option value="custom">Other</option>
        </select>
        ): null}
        {selectedOption === 'custom' ? (
          <div className="flex">
          <input
            className=' w-90 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            type="text"
            value={customOption}
            onChange={handleInputChange}
            placeholder="Please enter your option"
          />
          <button
            onClick={setSelectedOption.bind(null, customOption)}
            className='bg-gray-50 text-gray-900 rounded w-10'
          >
            <i className="fa-solid fa-rotate-left"/>
          </button>
        </div>
        ) : null}
      </div>
    );
  };
  
  export default CustomizableSelect;