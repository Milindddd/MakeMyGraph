import React, { createContext, useContext, useState, useCallback } from 'react';

const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGraphs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/graphs');
      if (!response.ok) throw new Error('Failed to fetch graphs');
      const data = await response.json();
      setGraphs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGraph = useCallback(async (graphData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/graphs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      });
      if (!response.ok) throw new Error('Failed to create graph');
      const newGraph = await response.json();
      setGraphs(prev => [...prev, newGraph]);
      setError(null);
      return newGraph;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGraph = useCallback(async (graphId, graphData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/graphs/${graphId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      });
      if (!response.ok) throw new Error('Failed to update graph');
      const updatedGraph = await response.json();
      setGraphs(prev => prev.map(g => g.id === graphId ? updatedGraph : g));
      setError(null);
      return updatedGraph;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGraph = useCallback(async (graphId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/graphs/${graphId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete graph');
      setGraphs(prev => prev.filter(g => g.id !== graphId));
      if (selectedGraph?.id === graphId) {
        setSelectedGraph(null);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedGraph]);

  const value = {
    graphs,
    selectedGraph,
    setSelectedGraph,
    isLoading,
    error,
    fetchGraphs,
    createGraph,
    updateGraph,
    deleteGraph,
  };

  return (
    <GraphContext.Provider value={value}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}; 