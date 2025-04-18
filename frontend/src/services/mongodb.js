const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const saveGraph = async (graphData) => {
  try {
    const response = await fetch(`${API_URL}/graphs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving graph:", error);
    throw error;
  }
};

export const getSavedGraphs = async () => {
  try {
    const response = await fetch(`${API_URL}/graphs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching graphs:", error);
    throw error;
  }
};

export const deleteGraph = async (graphId) => {
  try {
    const response = await fetch(`${API_URL}/graphs/${graphId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting graph:", error);
    throw error;
  }
}; 