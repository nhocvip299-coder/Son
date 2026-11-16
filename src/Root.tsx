import React from "react";
import { Composition } from "remotion";
import { AutoEdit } from "./compositions/AutoEdit";
import { Demo } from "./compositions/Demo";
import { HongDangVerify } from "./styles/hongDang/Verify";
import { TextPresetsGallery } from "./styles/textPresets/Gallery";
import { HongDangEdit, hdPlanDurationMs, type HdPlan } from "./styles/hongDang/HongDangEdit";
import { EMPTY_PLAN, planDurationMs, type EditPlan } from "./compositions/plan";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Demo" component={Demo} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="Demo60" component={Demo} durationInFrames={900} fps={60} width={1080} height={1920} />
      <Composition id="TextPresetsGallery" component={TextPresetsGallery} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition id="HongDangVerify" component={HongDangVerify} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition
        id="HongDangEdit"
        component={HongDangEdit}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ plan: { source: "demo/bg.mp4", fps: 30, segments: [{ srcStartMs: 0, srcEndMs: 2000, zoom: 1 }], items: [] } as HdPlan }}
        calculateMetadata={({ props }) => ({
          fps: props.plan.fps,
          durationInFrames: Math.max(1, Math.round((hdPlanDurationMs(props.plan) / 1000) * props.plan.fps)),
        })}
      />
      <Composition
        id="AutoEdit"
        component={AutoEdit}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ plan: EMPTY_PLAN as EditPlan }}
        calculateMetadata={({ props }) => ({
          fps: props.plan.fps,
          width: props.plan.width,
          height: props.plan.height,
          durationInFrames: Math.max(1, Math.round((planDurationMs(props.plan) / 1000) * props.plan.fps)),
        })}
      />
    </>
  );
};
