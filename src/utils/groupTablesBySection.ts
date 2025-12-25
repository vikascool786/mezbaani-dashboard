import { Table } from "../types/Table"; // define Table interface

export const groupTablesBySection = (tables: Table[]) => {
  return tables.reduce<Record<string, Table[]>>((acc, table) => {
    if (!acc[table.section]) acc[table.section] = [];
    acc[table.section].push(table);
    return acc;
  }, {});
};