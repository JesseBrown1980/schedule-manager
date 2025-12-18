import { ApiError } from "@/types";
import type {
  ConflictResponse,
  Room,
  Instructor,
  Student,
  Class,
  ClassFormData,
} from "@/types";

const API_BASE_URL = "/api";

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const trimmed = rawText.trim();
  let data: unknown = undefined;

  if (trimmed.length > 0) {
    const looksJson =
      contentType.includes("application/json") ||
      trimmed.startsWith("{") ||
      trimmed.startsWith("[");
    if (looksJson) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    } else {
      data = rawText;
    }
  }

  if (!response.ok) {
    const asObj =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;
    const detail = asObj?.detail;

    if (response.status === 409 && detail && typeof detail === "object") {
      const conflictData = detail as Record<string, unknown>;
      const conflicts = conflictData.conflicts;
      if (Array.isArray(conflicts)) {
        throw new ApiError(
          typeof conflictData.message === "string"
            ? conflictData.message
            : "Scheduling conflict detected",
          response.status,
          conflicts as ConflictResponse["conflicts"]
        );
      }
    }

    let message = "An error occurred";
    if (typeof data === "string" && data.trim().length > 0) {
      message = data;
    } else if (asObj) {
      if (typeof detail === "string" && detail.trim().length > 0) {
        message = detail;
      } else if (
        detail &&
        typeof detail === "object" &&
        typeof (detail as any).message === "string"
      ) {
        message = (detail as any).message;
      } else if (typeof asObj.message === "string") {
        message = asObj.message;
      } else if (detail != null) {
        message = JSON.stringify(detail);
      } else {
        message = JSON.stringify(asObj);
      }
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function getRooms(): Promise<Room[]> {
  return fetchJson<Room[]>("/rooms");
}

export async function getInstructors(): Promise<Instructor[]> {
  return fetchJson<Instructor[]>("/instructors");
}

export async function getStudents(): Promise<Student[]> {
  return fetchJson<Student[]>("/students");
}

export async function getClasses(date: string): Promise<Class[]> {
  return fetchJson<Class[]>(`/classes?date=${date}`);
}

export async function getClass(id: number): Promise<Class> {
  return fetchJson<Class>(`/classes/${id}`);
}

export async function createClass(data: ClassFormData): Promise<Class> {
  return fetchJson<Class>("/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClass(
  id: number,
  data: ClassFormData
): Promise<Class> {
  return fetchJson<Class>(`/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteClass(id: number): Promise<void> {
  return fetchJson<void>(`/classes/${id}`, {
    method: "DELETE",
  });
}
