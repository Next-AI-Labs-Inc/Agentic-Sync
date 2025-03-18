# Data Model System

The Data Model System is a flexible, configurable framework for creating and managing data-driven applications. It provides a comprehensive solution for defining data models, generating backend code, and building rich user interfaces with consistent UX patterns.

## Key Features

- **Configurable Data Models**: Define your data models with a rich configuration system
- **Dynamic UI Components**: Automatically generate UI components based on your model configuration
- **Backend Generation**: Create API routes and database models with a single click
- **Data Preview**: Visualize and explore data from different sources
- **Multi-Model Support**: Manage multiple data models in a single application
- **Template-Based Creation**: Create new data models by duplicating and customizing existing ones

## Architecture

The Data Model System is built with a modular architecture that separates concerns:

1. **Configuration**: Define the structure and behavior of your data models
2. **Providers**: Manage state and data access for your models
3. **UI Components**: Render and interact with your data
4. **Generators**: Create backend code from your model definitions
5. **Registry**: Manage and access your data models

## Usage

### Defining a Data Model

```typescript
import { createDataModelConfig } from './config/dataModels/baseConfig';

const myModelConfig = createDataModelConfig({
  dataType: 'products',
  slug: 'products',
  displayName: 'Products',
  
  model: {
    fields: {
      name: { 
        type: 'String', 
        required: true,
        label: 'Product Name',
        displayInList: true
      },
      description: { 
        type: 'String', 
        component: 'textarea',
        displayInList: false,
        displayInDetail: true
      },
      price: { 
        type: 'Number', 
        required: true 
      },
      category: { 
        type: 'String', 
        enum: ['Electronics', 'Clothing', 'Food', 'Other']
      },
      // ... other fields
    }
  },
  
  // UI configuration
  ui: {
    icon: 'FaBox',
    color: 'blue',
    listView: {
      fields: ['name', 'price', 'category'],
      layout: 'cards'
    },
    detailView: {
      layout: 'tabbed',
      sections: [
        { name: 'Overview', fields: ['name', 'price', 'category'] },
        { name: 'Details', fields: ['description', 'createdAt', 'updatedAt'] }
      ]
    },
    filters: [
      { field: 'category', type: 'dropdown' },
      { field: 'price', type: 'number' }
    ]
  },
  
  // Routes configuration
  routes: {
    base: '/products'
  },
  
  // Data source configuration
  dataSource: {
    type: 'mongodb',
    connectionString: process.env.MONGODB_URI
  }
});
```

### Using a Data Model in Your Application

```tsx
import { DataModelProvider, useDataModel } from './components/DataModelSystem';
import myModelConfig from './config/dataModels/myModelConfig';

// Component that uses the data model
function ProductList() {
  const { items, loading, filteredItems, setFilter } = useDataModel();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Products</h1>
      
      {/* Filter controls */}
      <select onChange={e => setFilter('category', e.target.value)}>
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Food">Food</option>
        <option value="Other">Other</option>
      </select>
      
      {/* Product list */}
      <div className="grid grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="border p-4 rounded">
            <h2>{item.name}</h2>
            <p>${item.price}</p>
            <span className="text-sm">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrap your application with the provider
function MyApp() {
  return (
    <DataModelProvider config={myModelConfig}>
      <ProductList />
    </DataModelProvider>
  );
}
```

### Generating Backend Code

```tsx
import { BackendGeneratorUI } from './components/DataModelSystem';
import myModelConfig from './config/dataModels/myModelConfig';

function BackendGenerator() {
  return (
    <div>
      <h1>Generate Backend Code</h1>
      <BackendGeneratorUI 
        config={myModelConfig}
        onSuccess={(result) => {
          console.log('Generated files:', result);
        }}
      />
    </div>
  );
}
```

## Configuration Options

### Field Types

The system supports various field types for your data models:

- `String`: Text values
- `Number`: Numeric values
- `Boolean`: True/false values
- `Date`: Date and time values
- `Array`: Arrays of values
- `Object`: Nested objects
- `Reference`: References to other models
- `Enum`: Values from a predefined list

### UI Components

The system provides built-in UI components for various field types:

- `input`: Standard text input
- `textarea`: Multi-line text input
- `select`: Dropdown selection
- `checkbox`: Boolean input
- `datepicker`: Date/time picker
- `tagInput`: Input for arrays of tags
- `listEditor`: Editor for arrays of text values
- `referenceList`: Editor for arrays of references

### Layouts

The system supports different layouts for list views:

- `cards`: Card-based layout
- `table`: Tabular layout
- `list`: Simple list layout

And for detail views:

- `basic`: Simple layout with all fields
- `tabbed`: Tabbed layout with sections
- `sectioned`: Sections with collapsible panels

## Extending the System

### Custom Components

You can extend the system with custom components:

```tsx
// Define a custom component
function PriceInput({ value, onChange }) {
  return (
    <div className="flex items-center">
      <span className="mr-2">$</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="border rounded p-2"
      />
    </div>
  );
}

// Register it in your configuration
const myModelConfig = createDataModelConfig({
  // ... other config
  ui: {
    // ... other UI config
    customComponents: {
      priceInput: PriceInput
    }
  },
  model: {
    fields: {
      price: {
        type: 'Number',
        component: 'priceInput' // Use your custom component
      }
    }
  }
});
```

### Custom Data Sources

You can implement custom data sources by providing your own API client:

```tsx
// Custom API client
const myApiClient = {
  list: async (options) => {
    // Custom implementation to fetch data
    const response = await fetch('https://api.example.com/products');
    return response.json();
  },
  getById: async (id) => {
    const response = await fetch(`https://api.example.com/products/${id}`);
    return response.json();
  },
  // ... other methods
};

// Use custom API client
function MyApp() {
  return (
    <DataModelProvider 
      config={myModelConfig}
      apiClient={myApiClient}
    >
      <ProductList />
    </DataModelProvider>
  );
}
```

## File Structure

```
/src
  /components
    /DataModelSystem
      DataModelProvider.tsx    # Data provider component
      DataModelItem.tsx        # Item display component
      DataModelSelector.tsx    # Model selection component
      DataModelConfigEditor.tsx # Configuration editor
      CreateModelForm.tsx      # Form for creating new models
      BackendGeneratorUI.tsx   # UI for generating backend code
      DataPreview.tsx          # Data preview component
      index.ts                 # Exports all components
  /config
    /dataModels
      baseConfig.ts            # Base configuration types and utilities
      tasksConfig.ts           # Tasks model configuration
      knowledgeBaseConfig.ts   # Knowledge base model configuration
      index.ts                 # Registry and exports
      /generators
        routeGenerator.ts      # API route generator
        modelGenerator.ts      # Database model generator
        index.ts               # Generator exports and utilities
  /contexts
    ConfigContext.tsx          # Context for config management
  /pages
    data-models.tsx            # Page for managing data models
```

## Best Practices

1. **Start with a Template**: Use existing models as templates for new ones
2. **Keep Configurations Clean**: Organize your configurations for readability
3. **Preview Before Saving**: Always preview your changes before saving
4. **Test Generated Code**: Test your generated backend code before deploying
5. **Use Consistent Naming**: Use consistent naming conventions for your models
6. **Document Your Models**: Document your models for other developers
7. **Separate Concerns**: Keep your data models separate from your business logic

## Conclusion

The Data Model System provides a powerful foundation for building data-driven applications. By separating the configuration from the implementation, it enables rapid development and consistent user experiences across different data types.

For more detailed information, see the API documentation and the example applications.