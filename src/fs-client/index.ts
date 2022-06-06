import { createObjectCsvWriter } from "csv-writer";
import { ObjectStringifierHeader } from "csv-writer/src/lib/record";

export const writeCSV = async (
  path: string,
  header: ObjectStringifierHeader,
  records: { [key: string]: string }[]
) => {
  const CSVWriter = createObjectCsvWriter({
    path,
    header,
  });

  await CSVWriter.writeRecords(records);
};
