import React, { useEffect, useState } from "react";
import "./App.css";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api";

const App: React.VFC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <KVStore />
      </header>
    </div>
  );
};

const KVStore: React.VFC = () => {
  const [kvs, setKvs] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    const start = performance.now();
    invoke("fetch_entries").then((entries) => {
      console.log(`[GET] ${performance.now() - start}ms`);
      setKvs(Object.fromEntries(entries as [string, string][]));
    });
  }, []);
  const genRandomKv = async () => {
    const key = Math.random().toString(36).substring(2);
    const value = Math.random().toString(36).substring(2);
    const start = performance.now();
    await invoke("persist_entry", { key, value });
    console.log(`[PUT] ${performance.now() - start}ms`);
    setKvs((cur) => ({ ...cur, [key]: value }));
  };
  return (
    <KVTable>
      <thead>
        <KVHeader>
          <td>Key</td>
          <td>Value</td>
        </KVHeader>
        <KVHeader>
          <td colSpan={2}>
            <button disabled={!kvs} onClick={() => genRandomKv()}>
              Click me!
            </button>
          </td>
        </KVHeader>
      </thead>
      <tbody>
        {kvs &&
          Object.entries(kvs).map(([k, v]) => (
            <KVEntry key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </KVEntry>
          ))}
      </tbody>
    </KVTable>
  );
};

const KVTable = styled.table`
  border: 1px solid black;
  border-collapse: collapse;

  td {
    padding: 4px;
    border: 1px solid black;
  }
`;

const KVHeader = styled.tr`
  border-bottom: 1px solid black;
  font-weight: bold;
`;

const KVEntry = styled.tr`
  font-family: monospace;
  text-align: left;
`;

export default App;
