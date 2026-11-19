import React from "react";
import { Composition } from "remotion";
import { AutoEdit } from "./compositions/AutoEdit";
import { Demo } from "./compositions/Demo";
import { HongDangVerify } from "./styles/hongDang/Verify";
import { QuyetTranLuxVerify, QTL_VERIFY_SEC } from "./styles/quyetTranLux/Verify";
import { QuyetTranLuxEdit, type QtlPlan } from "./styles/quyetTranLux/QuyetTranLuxEdit";
import { QtlLab, QTL_LAB_SEC } from "./styles/quyetTranLux/Lab";
import { QtlLab5, QTL_LAB5_SEC } from "./styles/quyetTranLux/Lab5";
import { QtlLab6, QTL_LAB6_SEC } from "./styles/quyetTranLux/Lab6";
import { IconStyles } from "./styles/quyetTranLux/IconStyles";
import { QtlLab8, QTL_LAB8_SEC } from "./styles/quyetTranLux/Lab8";
import { SanHoLuxFull, SANHO_FULL_SEC, type SanHoFullProps } from "./styles/quyetTranLux/SanHoLuxFull";
import { BdsLuxuryDemo, LUX_DEMO_SEC, type LuxDemoProps } from "./styles/bdsLuxury/SanHoDemo";
import { SanHoLuxMix, SANHO_MIX_SEC, type SanHoMixProps } from "./styles/bdsLuxury/SanHoMix";
import { HappyHome, HAPPY_HOME_SEC, type HappyHomeProps } from "./styles/bdsLuxury/HappyHome";
import { HappyHomeThumb, type ThumbProps } from "./styles/bdsLuxury/HappyHomeThumb";
import { TextPresetsGallery } from "./styles/textPresets/Gallery";
import { TextPresetsCatalog40, TextPresetsGallery40 } from "./styles/textPresets/Gallery40";
import { CapcutCatalog } from "./styles/textPresets/capcut/CapcutCatalog";
import { CapcutPageCompare } from "./styles/textPresets/capcut/CapcutPageCompare";
import { CapcutSamples } from "./styles/textPresets/capcut/CapcutSamples";
import { CapcutEdit, ccPlanDurationMs, type CcEditPlan } from "./styles/textPresets/capcut/CapcutEdit";
import { HongDangEdit, hdPlanDurationMs, type HdPlan } from "./styles/hongDang/HongDangEdit";
import { EMPTY_PLAN, planDurationMs, type EditPlan } from "./compositions/plan";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Demo" component={Demo} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Composition id="Demo60" component={Demo} durationInFrames={900} fps={60} width={1080} height={1920} />
      <Composition
        id="CapcutEdit"
        component={CapcutEdit}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ plan: { source: "demo/bg.mp4", fps: 30, segments: [{ srcStartMs: 0, srcEndMs: 2000, zoom: 1 }], items: [] } as CcEditPlan }}
        calculateMetadata={({ props }) => ({ fps: props.plan.fps, durationInFrames: Math.max(1, Math.round((ccPlanDurationMs(props.plan) / 1000) * props.plan.fps)) })}
      />
      <Composition
        id="CapcutSamples"
        component={CapcutSamples}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ items: [], eachS: 2.6, words: [] }}
        calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props.items.length * props.eachS + (props.words?.length ? 6 : 0)) * 30) })}
      />
      <Composition id="CapcutPageCompare" component={CapcutPageCompare} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ cells: {}, k: 1 }} />
      <Composition id="CapcutCatalog" component={CapcutCatalog} durationInFrames={3600} fps={30} width={1080} height={1920} defaultProps={{ showLabel: true }} />
      <Composition id="TextPresetsGallery40" component={TextPresetsGallery40} durationInFrames={384} fps={30} width={1080} height={1920} />
      <Composition id="TextPresetsCatalog40" component={TextPresetsCatalog40} durationInFrames={2160} fps={30} width={1080} height={1920} />
      <Composition id="TextPresetsGallery" component={TextPresetsGallery} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition id="QuyetTranLuxVerify" component={QuyetTranLuxVerify} durationInFrames={Math.round(QTL_VERIFY_SEC * 30)} fps={30} width={1080} height={1920} />
      <Composition id="QuyetTranLuxVerify60" component={QuyetTranLuxVerify} durationInFrames={Math.round(QTL_VERIFY_SEC * 60)} fps={60} width={1080} height={1920} />
      <Composition
        id="QuyetTranLuxEdit"
        component={QuyetTranLuxEdit}
        durationInFrames={60}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ plan: { source: "demo/bg.mp4", fps: 60, items: [], words: [], durationSec: 1, captions: "phrase" } as QtlPlan }}
        calculateMetadata={({ props }) => ({ fps: props.plan.fps, durationInFrames: Math.max(1, Math.round(props.plan.durationSec * props.plan.fps)) })}
      />
      <Composition id="QtlLab" component={QtlLab} durationInFrames={Math.round(QTL_LAB_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ stem: "all" as const }} />
      <Composition id="QtlLab5" component={QtlLab5} durationInFrames={Math.round(QTL_LAB5_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ stem: "all" as const }} />
      <Composition id="QtlLab6" component={QtlLab6} durationInFrames={Math.round(QTL_LAB6_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ stem: "all" as const }} />
      <Composition id="IconStyles" component={IconStyles} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="QtlLab8" component={QtlLab8} durationInFrames={Math.round(QTL_LAB8_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ stem: "all" as const }} />
      <Composition id="SanHoLuxFull" component={SanHoLuxFull} durationInFrames={Math.round(SANHO_FULL_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: "phrase", words: [], stem: "all" } as SanHoFullProps} />
      <Composition id="BdsLuxuryDemo" component={BdsLuxuryDemo} durationInFrames={Math.round(LUX_DEMO_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: "phrase", words: [], stem: "all" } as LuxDemoProps} />
      <Composition id="SanHoLuxMix" component={SanHoLuxMix} durationInFrames={Math.round(SANHO_MIX_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: "phrase", words: [], stem: "all" } as SanHoMixProps} />
      <Composition id="HappyHome" component={HappyHome} durationInFrames={Math.round(HAPPY_HOME_SEC * 60)} fps={60} width={1080} height={1920} defaultProps={{ captions: "phrase", words: [], stem: "all" } as HappyHomeProps} />
      <Composition id="HappyHomeThumb" component={HappyHomeThumb} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ t: 12.0 } as ThumbProps} />
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
