import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { specificationService } from '../services/specificationService';
import Select from './common/Select';

const SpecificationSelector = ({ 
  category, 
  type, 
  value, 
  onChange,
  onSizeChange,
  selectedSize 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadOptions = () => {
      const items = specificationService.searchSpecifications(category, type, searchTerm);
      setOptions(items);
    };

    loadOptions();
  }, [category, type, searchTerm]);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const selectedOption = value ? options.find(opt => opt.id === value.id) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Buscar ${category}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedOption && !searchTerm && (
          <div className="absolute right-2 top-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {selectedOption.name}
          </div>
        )}
        {isOpen && options.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {options.map(option => (
              <div
                key={option.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium">{option.name}</div>
                {option.brand && (
                  <div className="text-sm text-gray-600">{option.brand}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selector de tamaño si está disponible */}
      {selectedOption?.sizes && onSizeChange && (
        <Select
          options={selectedOption.sizes.map(size => ({
            value: size,
            label: category === 'storage' 
              ? size >= 1000 
                ? `${size/1000}TB` 
                : `${size}GB`
              : `${size}GB`
          }))}
          value={selectedSize || ''}
          onChange={(value) => onSizeChange(Number(value))}
          placeholder="Seleccionar tamaño"
        />
      )}
    </div>
  );
};

SpecificationSelector.propTypes = {
  category: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    score: PropTypes.number,
    sizes: PropTypes.arrayOf(PropTypes.number)
  }),
  onChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func,
  selectedSize: PropTypes.number
};

export default SpecificationSelector; 