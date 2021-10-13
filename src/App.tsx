import React, { useState } from "react";
import "./App.css";
import styled from "styled-components";

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
  const [kvs, setKvs] = useState<Record<string, string>>({});
  const genRandomKv = () => {
    const k = Math.random().toString(36).substring(2);
    const v = Math.random().toString(36).substring(2);
    setKvs((cur) => ({ ...cur, [k]: v }));
  };
  return (
    <KVTable>
      <KVHeader>
        <td>Key</td>
        <td>Value</td>
      </KVHeader>
      {Object.entries(kvs).map((k, v) => (
        <tr>
          <td>{k}</td>
          <td>{v}</td>
        </tr>
      ))}
      <tr>
        <button onClick={() => genRandomKv()}>Click me!</button>
      </tr>
    </KVTable>
  );
};

const KVTable = styled.table`
  border: 1px solid black;
  border-collapse: collapse;
`;

const KVHeader = styled.tr`
  border-bottom: 1px solid black;
`;

export default App;
