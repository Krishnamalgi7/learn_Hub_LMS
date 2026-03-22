import { HttpError } from "../../middleware/error.middleware";
import { getSectionById, listSectionsBySubject, type Section } from "./section.repository";

export const getSections = async (subjectId: number): Promise<Section[]> => {
  return listSectionsBySubject(subjectId);
};

export const getSection = async (id: number): Promise<Section> => {
  const section = await getSectionById(id);
  if (!section) {
    throw new HttpError(404, "Section not found");
  }
  return section;
};

