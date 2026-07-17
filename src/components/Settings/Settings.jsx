import { useContext } from "react";
import { Context } from "../../context/Context.jsx";
import "./Settings.css";

const models = [
  { id: "gemini", name: "Gemini 3.1 Flash Lite" },
  { id: "groq", name: "Groq Compound Mini" },
  { id: "openai", name: "OpenAI oss-120b " },
];

const Settings = () => {
  const { selectedModel, setSelectedModel, showSettings, setShowSettings } = useContext(Context);

  if (!showSettings) return null;

  return (
    <div className="settings-overlay" onClick={() => setShowSettings(false)}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={() => setShowSettings(false)}>×</button>
        </div>
        <div className="settings-body">
          <div className="settings-group">
            <label className="settings-label">AI Model</label>
            <select
              className="settings-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
