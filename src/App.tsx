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
    invoke("fetch_entries").then((entries) => {
      setKvs(Object.fromEntries(entries as [string, string][]));
    });
  }, []);
  const genRandomKv = async () => {
    const key = Math.random().toString(36).substring(2);
    const value = Math.random().toString(36).substring(2);
    await invoke("persist_entry", { key, value });
    setKvs((cur) => ({ ...cur, [key]: value }));
  };
  return (
    <KVTable>
      <KVHeader>
        <td>Key</td>
        <td>Value</td>
      </KVHeader>
      {kvs &&
        Object.entries(kvs).map(([k, v]) => (
          <tbody>
            <td>{k}</td>
            <td>{v}</td>
          </tbody>
        ))}
      <tfoot>
        <td colSpan={2}>
          <button disabled={!kvs} onClick={() => genRandomKv()}>
            Click me!
          </button>
        </td>
      </tfoot>
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

const KVHeader = styled.thead`
  border-bottom: 1px solid black;
  font-weight: bold;
`;

export default App;
