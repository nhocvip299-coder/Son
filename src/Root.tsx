import React from "react";
import { Composition } from "remotion";
import { AutoEdit } from "./compositions/AutoEdit";
import { Demo } from "./compositions/Demo";
import { EMPTY_PLAN, planDurationMs, type EditPlan } from "./compositions/plan";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Demo" component={Demo} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="Demo60" component={Demo} durationInFrames={900} fps={60} width={1080} height={1920} />
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
