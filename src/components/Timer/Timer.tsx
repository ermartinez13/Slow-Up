import { useState } from "react";

import { ActionButtons } from "./ActionButtons";
import { TimeDisplay } from "./TimeDisplay";
import { notify, updatePartialEntry } from "../../helpers";
import { PartialEntry, WorkUnit } from "./Timer.models";
import { ControlledTextArea } from "../ControlledTextArea";
import { DEFAULT_ENTRY, DEFAULT_TIME } from "./Timer.constants";
import { TimeRange } from "../TimeRange";
import { useTick } from "../../hooks/use-tick";
import { ToolStatus } from "../../models/tool.models";

interface Props {
  addEntry: (timeEntry: WorkUnit) => void;
}

export function Timer({ addEntry }: Props) {
  const {
    ticks: timeSpent,
    isRunning,
    start: startTicks,
    stop: stopTicks,
    reset,
  } = useTick({ tickLength: 100 });
  const [timeBudget, setTimeBudget] = useState(DEFAULT_TIME);
  const [partialEntry, setPartialEntry] = useState<PartialEntry>({
    ...DEFAULT_ENTRY,
  });
  const millisecondsLeft = timeBudget - timeSpent;

  const getStatus = () => {
    if (isRunning) return ToolStatus.ON;
    else if (timeSpent > 0) return ToolStatus.PAUSED;
    else return ToolStatus.OFF;
  };

  const status = getStatus();

  const start = () => {
    if (status === ToolStatus.ON) return;
    startTicks();
    if (partialEntry.start === -1) {
      setPartialEntry((prev) =>
        updatePartialEntry(prev, {
          start: Date.now(),
        })
      );
    }
  };

  const stop = () => {
    if (status === ToolStatus.OFF) return;
    reset();
    notify();
    const timeEntry: WorkUnit = {
      ...partialEntry,
      end: Date.now(),
      spent: timeSpent,
    };
    setPartialEntry({ ...DEFAULT_ENTRY });
    addEntry(timeEntry);
  };

  const pause = () => {
    if (status === ToolStatus.PAUSED) return;
    stopTicks();
  };

  const setContent = (content: string) => {
    setPartialEntry((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleStartPauseClick = () => {
    if (status === ToolStatus.ON) {
      pause();
    } else {
      if (status === ToolStatus.OFF) {
        window.addEventListener("beforeunload", beforeUnloadHandler);
      }
      start();
    }
  };

  const handleStopClick = () => {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    stop();
  };

  if (timeSpent >= timeBudget && status !== ToolStatus.OFF) {
    stop();
  }

  return (
    <div className="grid gap-y-8 place-content-center">
      <TimeDisplay
        millisecondsLeft={millisecondsLeft}
        setTimeBudget={setTimeBudget}
        key={millisecondsLeft}
        status={status}
      />
      <TimeRange
        millisecondsLeft={millisecondsLeft}
        status={status}
        startTimeMs={partialEntry.start}
      />
      <ActionButtons
        onStartPauseClick={handleStartPauseClick}
        onStopClick={handleStopClick}
        status={status}
      />
      <ControlledTextArea
        content={partialEntry.description}
        setContent={setContent}
        key={partialEntry.description}
      />
    </div>
  );
}

function beforeUnloadHandler(e: BeforeUnloadEvent) {
  e.preventDefault();
  // included for legacy support, e.g. Chrome/Edge < 119
  e.returnValue = true;
}
