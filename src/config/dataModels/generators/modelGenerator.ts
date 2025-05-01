/**
 * Model Generator
 * 
 * Generates MongoDB schema models for a data model based on its configuration.
 * This module creates the necessary schema definition for MongoDB.
 */

import path from 'path';
import fs from 'fs/promises';
import { DataModelConfig, FieldConfig } from '../baseConfig';

/**
 * Generate MongoDB schema for a data model
 */
export async function generateModel(config: DataModelConfig, basePath: string): Promise<string> {
  // Create the models directory
  const modelsDir = path.join(basePath, 'models');
  try {
    await fs.mkdir(modelsDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating models directory: ${error}`);
    throw error;
  }
  
  // Generate model file
  const modelPath = path.join(modelsDir, `${config.slug}.js`);
  await fs.writeFile(modelPath, generateModelFile(config));
  
  return modelPath;
}

/**
 * Generate model file content
 */
function generateModelFile(config: DataModelConfig): string {
  const schemaName = config.dataType === 'knowledgeBase' ? 'KnowledgeBaseSchema' : `${capitalize(config.slug)}Schema`;
  
  return `/**
 * ${config.displayName} MongoDB Schema
 * 
 * This file defines the MongoDB schema for the ${config.displayName} data model.
 * Generated automatically from data model configuration.
 */

import mongoose from 'mongoose';

const ${schemaName} = new mongoose.Schema(
  {
    ${generateSchemaFields(config)}
  },
  { 
    timestamps: ${config.model.timestamps || true}, 
    collection: '${config.slug}' 
  }
);

// Add indexes
${generateSchemaIndexes(config, schemaName)}

// Add virtual for id
${schemaName}.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON output
${schemaName}.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

// Export the model
export default mongoose.models.${capitalize(config.slug)} || 
  mongoose.model('${capitalize(config.slug)}', ${schemaName});
`;
}

/**
 * Generate schema fields
 */
function generateSchemaFields(config: DataModelConfig): string {
  const fields = Object.entries(config.model.fields)
    .filter(([fieldName]) => fieldName !== 'id') // Skip id field as MongoDB provides _id
    .map(([fieldName, field]) => {
      return `${fieldName}: ${generateFieldDefinition(field)}`;
    })
    .join(',\n    ');
  
  return fields;
}

/**
 * Generate a field definition
 */
function generateFieldDefinition(field: FieldConfig): string {
  // Basic field with just type
  if (Object.keys(field).length === 1 && field.type) {
    return `{ type: ${mapFieldType(field.type)} }`;
  }
  
  // More complex field with options
  let definition = '{\n      ';
  
  // Add type
  definition += `type: ${mapFieldType(field.type)}`;
  
  // Add required if specified
  if (field.required) {
    definition += ',\n      required: true';
  }
  
  // Add default if specified
  if (field.default !== undefined) {
    const defaultValue = typeof field.default === 'string' 
      ? `'${field.default}'` 
      : field.default;
    definition += `,\n      default: ${defaultValue}`;
  }
  
  // Add enum values if specified
  if (field.type === 'Enum' && field.enum) {
    const enumValues = Array.isArray(field.enum) 
      ? `[${field.enum.map(v => `'${v}'`).join(', ')}]` 
      : '[]';
    definition += `,\n      enum: ${enumValues}`;
  }
  
  // Add reference if specified
  if (field.type === 'Reference' && field.reference) {
    definition += `,\n      ref: '${capitalize(field.reference)}'`;
  }
  
  // Add validation
  if (field.validation) {
    if (field.validation.minLength) {
      definition += `,\n      minLength: ${field.validation.minLength}`;
    }
    if (field.validation.maxLength) {
      definition += `,\n      maxLength: ${field.validation.maxLength}`;
    }
    if (field.validation.min) {
      definition += `,\n      min: ${field.validation.min}`;
    }
    if (field.validation.max) {
      definition += `,\n      max: ${field.validation.max}`;
    }
    if (field.validation.pattern) {
      definition += `,\n      match: /${field.validation.pattern}/`;
    }
  }
  
  // Close the field definition
  definition += '\n    }';
  
  return definition;
}

/**
 * Map field type to MongoDB schema type
 */
function mapFieldType(type: string): string {
  switch (type) {
    case 'String':
      return 'String';
    case 'Number':
      return 'Number';
    case 'Boolean':
      return 'Boolean';
    case 'Date':
      return 'Date';
    case 'Array':
      return 'Array';
    case 'Object':
      return 'Object';
    case 'Reference':
      return 'mongoose.Schema.Types.ObjectId';
    case 'Enum':
      return 'String';
    default:
      return 'String';
  }
}

/**
 * Generate schema indexes
 */
function generateSchemaIndexes(config: DataModelConfig, schemaName: string): string {
  if (!config.model.indexes || config.model.indexes.length === 0) {
    return '// No custom indexes defined';
  }
  
  return config.model.indexes.map(index => {
    const fields = index.fields.reduce((obj, field) => {
      obj[field] = 1;
      return obj;
    }, {} as Record<string, number>);
    
    const options = index.unique ? ', { unique: true }' : '';
    return `${schemaName}.index(${JSON.stringify(fields)}${options});`;
  }).join('\n');
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default { generateModel };