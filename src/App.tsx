import { NotificationsPermission } from "./components/NotificationsPermission";
import { TimeEntries } from "./components/TimeEntries";
import { getEntryIndex } from "./helpers";
import { WorkEntry } from "./models";
import { useLocalStorage } from "./hooks/use-local-storage";
import { TimeTool } from "./components/TimeTool/TimeTool";

const INITIAL_ENTRIES: WorkEntry[] = [];

function App() {
  const [entries, setEntries] = useLocalStorage<WorkEntry[]>(
    "entries",
    INITIAL_ENTRIES
  );

  const addEntry = (entry: WorkEntry) => {
    setEntries(entries.concat(entry));
  };

  const updateEntry = (entry: WorkEntry) => {
    const nextEntries = window.structuredClone(entries);
    const targetIdx = getEntryIndex(entry, nextEntries);
    Object.assign(nextEntries[targetIdx], entry);
    setEntries(nextEntries);
  };

  const deleteEntry = (entry: WorkEntry) => {
    const targetIdx = getEntryIndex(entry, entries);
    const nextEntries = entries.toSpliced(targetIdx, 1);
    setEntries(nextEntries);
  };

  return (
    <main className="grid gap-y-20">
      <section>
        <NotificationsPermission />
        <TimeTool addEntry={addEntry} />
      </section>
      <section>
        <TimeEntries
          entries={entries}
          updateEntry={updateEntry}
          deleteEntry={deleteEntry}
        />
      </section>
    </main>
  );
}

export default App;
