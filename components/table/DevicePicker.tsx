"use client";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { Icon, type IconName } from "@/components/ui/Icon";
import { menuItemClass as item } from "@/components/ui/Button";

function Devices({ kind, icon, onPick }: { kind: "videoinput" | "audioinput"; icon: IconName; onPick: () => void }) {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });
  return devices.map((d) => (
    <button
      key={d.deviceId}
      type="button"
      className={`${item} ${d.deviceId === activeDeviceId ? "text-accent" : ""}`}
      onClick={() => {
        setActiveMediaDevice(d.deviceId);
        onPick();
      }}
    >
      <Icon name={icon} /> <span className="truncate">{d.label || (kind === "videoinput" ? "Camera" : "Microphone")}</span>
    </button>
  ));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-1 last:border-0 last:pb-0 [&+&]:pt-1">
      <div className="px-2 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      {children}
    </div>
  );
}

/** Camera and microphone selection plus the Krisp noise filter toggle. Renders inside a menu. */
export function DevicePicker({ onPick }: { onPick: () => void }) {
  const krisp = useKrispNoiseFilter();
  return (
    <div>
      <Section title="Camera">
        <Devices kind="videoinput" icon="camera" onPick={onPick} />
      </Section>
      <Section title="Microphone">
        <Devices kind="audioinput" icon="mic" onPick={onPick} />
        <button
          type="button"
          className={item}
          disabled={krisp.isNoiseFilterPending}
          title="Krisp noise cancellation. Cuts shuffling, keyboards and room noise."
          onClick={() => krisp.setNoiseFilterEnabled(!krisp.isNoiseFilterEnabled)}
        >
          <Icon name={krisp.isNoiseFilterEnabled ? "check" : "mic"} className={krisp.isNoiseFilterEnabled ? "text-accent" : "text-muted"} />
          Noise filter {krisp.isNoiseFilterPending ? "…" : krisp.isNoiseFilterEnabled ? "on" : "off"}
        </button>
      </Section>
    </div>
  );
}
