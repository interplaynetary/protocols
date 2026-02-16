
import { agents } from '../src/db/schema'

console.log('Inspecting Drizzle Column Structure:')
const nameColumn = agents.name
console.log('Column "name":', nameColumn)
console.log('DataType:', nameColumn.dataType)
console.log('ColumnType:', nameColumn.columnType)
console.log('NotNull:', nameColumn.notNull)

const idColumn = agents.id
console.log('\nColumn "id":', idColumn)
console.log('DataType:', idColumn.dataType)
console.log('ColumnType:', idColumn.columnType)
