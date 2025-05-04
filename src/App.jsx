import React, { useReducer, useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import getAiResponse from "./apiData";
//import { useGetAiData } from "./useGetAiData";
import "./App.css";

const initialState = {
  step: 0,
  responses: {},
  objection: "",
  prepInputs: {
    availability: "",
    financial: "",
    decision: "",
    timing: "",
    support: "",
  },
  result: "",
  dealScore: "Medium",
  coachingTip: "",
  showDashboard: false,
  roleplayMode: false,
  roleplayResponse: null,
  userResponse: "",
  aiSuggestedResponse: null,
  showSummary: false,
  contactName: "",
  iceScore: { influence: "1", control: "2", engagement: "2", urgency: "3" }, // Your sample values
  iceGuidance: "",
  feelings: "",
  thinking: "",
  trust: "",
  forward: "",
};

function reducer(state, action) {
  // console.log("state", state);
  // console.log("action", action);
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_RESPONSE":
      return {
        ...state,
        responses: { ...state.responses, [action.key]: action.payload },
      };
    case "SET_OBJECTION":
      return { ...state, objection: action.payload };
    case "SET_STOCK_STATUS":
      return {
        ...state,
        prepInputs: { ...state.prepInputs, availability: action.payload },
      };
    case "SET_PREP_INPUT":
      return {
        ...state,
        prepInputs: { ...state.prepInputs, [action.key]: action.payload },
      };
    case "SET_RESULT":
      return { ...state, result: action.payload, coachingTip: action.tip };
    case "SET_DEAL_SCORE":
      return state; //return { ...state, dealScore: action.payload };
    case "TOGGLE_DASHBOARD":
      return { ...state, showDashboard: !state.showDashboard };
    case "SET_ROLEPLAY_MODE":
      return {
        ...state,
        roleplayMode: action.payload,
        roleplayResponse: action.response || null,
      };
    case "SET_USER_RESPONSE":
      return { ...state, userResponse: action.payload };
    case "SET_AI_SUGGESTION":
      return { ...state, aiSuggestedResponse: action.payload };
    case "TOGGLE_SUMMARY":
      return { ...state, showSummary: !state.showSummary };
    case "SET_CONTACT_NAME":
      return { ...state, contactName: action.payload };
    case "SET_ICE_SCORE":
      return {
        ...state,
        iceScore: { ...state.iceScore, [action.key]: action.payload },
        iceGuidance: generateGuidance({
          ...state.iceScore,
          [action.key]: action.payload,
        }),
      };
    case "SET_FEELINGS":
      return { ...state, feelings: action.payload };
    case "SET_THINKING":
      return { ...state, thinking: action.payload };
    case "SET_TRUST":
      return { ...state, trust: action.payload };
    case "SET_FORWARD":
      return { ...state, forward: action.payload };
    default:
      return state;
  }
}

const preloadedData = {
  objectionFlip: [
    "Too pricey → ‘Compared to what?’ → ‘Did I ask budget?’",
    "Need time → ‘What’s your timeline?’ → ‘Did I ask deadline?’",
    "No stock → ‘Split now, rest later?’ → ‘Did I ask quantity?’",
    "Unsure quality → ‘95% satisfaction—proof?’ → ‘Did I ask standards?’",
    "Budget tight → ‘ROI in 30 days?’ → ‘Did I ask range?’",
    "Lack trust → ‘99.9% uptime—see it?’ → ‘Did I ask issues?’",
    "Too risky → ‘20% risk drop—safe?’ → ‘Did I ask tolerance?’",
    "Not urgent → ‘Q2 25% faster—why wait?’ → ‘Did I ask goals?’",
    "Support weak → ‘24/7 team—good?’ → ‘Did I ask needs?’",
    "Can’t scale → ‘20% growth—ready?’ → ‘Did I ask plan?’",
  ],
  availability: [
    "30 units available—ready now.",
    "50 units in stock—Client X saved 10%.",
    "20 units—ships tomorrow.",
    "100 units—Q2 secured.",
    "10 units—split option available.",
    "40 units—proven reliability.",
    "25 units—Client Y cut costs 15%.",
    "60 units—immediate delivery.",
    "15 units—Client Z boosted uptime.",
    "35 units—stock confirmed today.",
  ],
  financial: [
    "PO or Credit Card?—your call.",
    "15% ROI—pays in 30 days.",
    "Cash upfront?—discount possible.",
    "Split Q2/Q3?—flexible terms.",
    "PO by Friday?—Q2 locked.",
    "ROI beats $10K fee—Client A doubled.",
    "Monthly terms?—easy fit.",
    "Pay Q3?—value kicks in Q2.",
    "Credit Card now?—10% off.",
    "Split payments?—Client B loved it.",
  ],
  decision: [
    "Who signs?—let’s loop them.",
    "You approve?—great.",
    "VP signs?—I’ll draft it.",
    "Team decides?—who’s lead?",
    "You say YES?—done.",
    "CFO call?—I’ll set it.",
    "Board approval?—when’s next?",
    "You’re the one?—perfect.",
    "Exec signs?—I’ll prep.",
    "Who’s final?—let’s chat.",
  ],
  timing: [
    "Q2 start?—25% faster close.",
    "Next week?—ROI kicks in.",
    "Q3 trial?—30-day value.",
    "Tomorrow?—3-day delivery.",
    "Q2 locked?—Client G sped up.",
    "This month?—beats avg.",
    "Q4 push?—20% growth.",
    "Friday sign?—Q2 ready.",
    "Now?—80% close faster.",
    "Next call?—set it.",
  ],
  support: [
    "Weekly check-ins?—we’re on.",
    "24/7 team?—90% fixed fast.",
    "Monthly sync?—Client D cut tickets.",
    "Daily ping?—you’re covered.",
    "Q2 support?—always here.",
    "Chat line?—instant help.",
    "Weekly calls?—Client E scaled.",
    "24-hour fix?—99% uptime.",
    "Bi-weekly?—your pace.",
    "Support Q3?—locked in.",
  ],
  feelings: [
    "Fear of cost → ‘ROI beats it—seen it?’",
    "Doubt quality → ‘95% love it—proof?’",
    "Risk worry → ‘20% safer—data here.’",
    "Time stress → ‘We’ll speed it—how?’",
  ],
  thinking: [
    "Low I → Find the boss—next call?",
    "High C → Draft PO—send today?",
    "Low E → Email facts—short list?",
    "High U → Meet now—lock Q2?",
  ],
  trust: [
    "99.9% uptime—Client A’s case?",
    "15% ROI—Client B doubled.",
    "24/7 support—Client C scaled.",
    "20% growth—Client D’s win.",
  ],
  forward: [
    "Check-in Friday—Q2 plan?",
    "PO draft Monday—good?",
    "Call next week—lock it?",
    "Email stats—move now?",
  ],
};

const generateGuidance = ({ influence, control, engagement, urgency }) => {
  const iNum = parseInt(influence, 10);
  const cNum = parseInt(control, 10);
  const eNum = parseInt(engagement, 10);
  const uNum = parseInt(urgency, 10);
  const i =
    iNum > 2
      ? "Key player—address their needs"
      : iNum > 0
      ? "Low sway—find their boss"
      : "";
  const c =
    cNum > 2
      ? "Decider—earn their YES"
      : cNum > 0
      ? "Gatekeeper—bypass or charm"
      : "";
  const e =
    eNum > 2
      ? "Talkative—build rapport"
      : eNum > 0
      ? "Quiet—use facts, short pitches"
      : "";
  const u =
    uNum > 3 ? "Urgent—close now" : uNum > 0 ? "Not urgent—nudge later" : "";
  return (
    `${i}${i && c ? ". " : ""}${c}${c && e ? ". " : ""}${e}${
      e && u ? ". " : ""
    }${u}${u ? "." : ""}`.trim() || "Set ICEU Score for guidance"
  );
};

const formatIceScore = ({ influence, control, engagement, urgency }) => {
  const iNum = parseInt(influence, 10);
  const cNum = parseInt(control, 10);
  const eNum = parseInt(engagement, 10);
  const uNum = parseInt(urgency, 10);
  const i =
    iNum > 2
      ? `Influence: Key player—address their needs (${iNum})`
      : iNum > 0
      ? `Influence: Low sway—find their boss (${iNum})`
      : "Influence: Not set (0)";
  const c =
    cNum > 2
      ? `Control: Decider—earn their YES (${cNum})`
      : cNum > 0
      ? `Control: Gatekeeper—bypass or charm (${cNum})`
      : "Control: Not set (0)";
  const e =
    eNum > 2
      ? `Engagement: Talkative—build rapport (${eNum})`
      : eNum > 0
      ? `Engagement: Quiet—use facts, short pitches (${eNum})`
      : "Engagement: Not set (0)";
  const u =
    uNum > 3
      ? `Urgency: Urgent—close now (${uNum})`
      : uNum > 0
      ? `Urgency: Not urgent—nudge later (${uNum})`
      : "Urgency: Not set (0)";
  return `${i}. ${c}. ${e}. ${u}.`;
};

function App() {
  //  const { aiResponse, setRequest } = useGetAiData();
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (defaultState) => {
      const saved = localStorage.getItem("iceState");
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        ...defaultState,
        ...parsed,
        iceScore: {
          influence: parsed.iceScore?.influence || "1", // Default to your sample
          control: parsed.iceScore?.control || "2",
          engagement: parsed.iceScore?.engagement || "2",
          urgency: parsed.iceScore?.urgency || "3",
        },
      };
    }
  );

  useEffect(() => {
    localStorage.setItem("iceState", JSON.stringify(state));
    const uNum = parseInt(state.iceScore.urgency, 10);
    const cNum = parseInt(state.iceScore.control, 10);
    if (uNum > 3 && cNum > 3) {
      dispatch({ type: "SET_DEAL_SCORE", payload: "High+" });
    } else if (state.prepInputs.availability && state.result) {
      dispatch({
        type: "SET_DEAL_SCORE",
        payload: state.prepInputs.availability.includes("available")
          ? "High"
          : "Low",
      });
    }
  }, [state]);

  const iceSteps = [
    {
      title: "Handle NOs",
      description: "Flip objections fast—log, reframe, check gaps.",
      placeholder: "Log objection (e.g., 'Too pricey')",
    },
    {
      title: "Win YESes",
      description: "Lock the deal with trust and momentum.",
      placeholder: "Start with Availability...",
    },
  ];

  console.log('refresh');
  const handleReset = () => {
    dispatch({
      type: "SET_RESPONSE",
      key: iceSteps[state.step].title,
      payload: "",
    });
    setAiSuggestion(null);
  };

  const handleNextStep = () => {
    if (state.step < iceSteps.length - 1)
      dispatch({ type: "SET_STEP", payload: state.step + 1 });
  };

  const handleHasResponse = (response) => {
    if (response) return true;
    console.log('here');
    //setAiSuggestion(null);
    return false;
  };

  const handlePrevStep = () => {
    if (state.step > 0) dispatch({ type: "SET_STEP", payload: state.step - 1 });
  };

  const checkStock = () => {
    setTimeout(() => {
      const stock =
        Math.random() > 0.3 ? "30 units available" : "Short—split it.";
      dispatch({ type: "SET_STOCK_STATUS", payload: stock });
      dispatch({
        type: "SET_DEAL_SCORE",
        payload: stock.includes("available") ? "High" : "Low",
      });
    }, 1000);
  };

  const getCoachingTip = (objection) => {
    if (!objection) return "Ask: 'What’s your top priority?'";
    if (objection.toLowerCase().includes("price"))
      return "Try: 'ROI beats cost—let’s break it down.'";
    if (objection.toLowerCase().includes("time"))
      return "Ask: 'What’s your timeline? I’ll speed it.'";
    return "Ask: 'What’s your top priority?'";
  };

  const cubeDeal = () => {
    const dealResult = `Cubed! Availability: ${
      state.prepInputs.availability || "TBD"
    }—Financial: ${state.prepInputs.financial || "TBD"}—Decision: ${
      state.prepInputs.decision || "TBD"
    }—Timing: ${state.prepInputs.timing || "TBD"}—Support: ${
      state.prepInputs.support || "TBD"
    }. Yes locked!`;
    dispatch({
      type: "SET_RESULT",
      payload: dealResult,
      tip: getCoachingTip(state.objection),
    });
  };

  const handleRoleplay = () => {
    const uNum = parseInt(state.iceScore.urgency, 10);
    const response =
      parseInt(state.iceScore.engagement, 10) < 3 &&
      parseInt(state.iceScore.engagement, 10) > 0
        ? "AI: 'Too pricey.'"
        : uNum > 3
        ? "AI: 'It’s pricey—Q2’s tight, how do we lock it now?'"
        : "AI: 'It’s pricey—how do you see it fitting your goals?'";
    dispatch({
      type: "SET_ROLEPLAY_MODE",
      payload: true,
      response: `${response} (ICEU: ${state.iceScore.influence}-${state.iceScore.control}-${state.iceScore.engagement}-${state.iceScore.urgency})`,
    });
  };

  const handleUserResponse = () => {
    const uNum = parseInt(state.iceScore.urgency, 10);
    const suggestedResponses =
      parseInt(state.iceScore.control, 10) > 3
        ? uNum > 3
          ? [
              "ROI’s 15%—sign by Friday?",
              "Value’s clear—Q2’s now!",
              "15% lift—lock it today.",
            ]
          : [
              "ROI’s 15%—sign by Q2?",
              "Value’s clear—ready to lock?",
              "15% lift—your call now.",
            ]
        : [
            "I get it—what’s holding you?",
            "ROI’s solid—want a case?",
            "What’s your timeline?—I’ll adjust.",
          ];
    dispatch({
      type: "SET_AI_SUGGESTION",
      payload: suggestedResponses[Math.floor(Math.random() * 3)],
    });
  };

  const getAiSuggestion = async (input, type) => {
    const dataKey =
      {
        "Handle NOs": "objectionFlip",
        "Win YESes":
          Object.keys(state.prepInputs)[state.step - 1] || "availability",
        "Fact Your Feelings": "feelings",
        "Targeted Thinking": "thinking",
        "Trigger Trust": "trust",
        "Fuel It Forward": "forward",
      }[type] || "objectionFlip";
    let suggestion =
      preloadedData[dataKey].find((item) =>
        item.toLowerCase().includes(input.toLowerCase())
      ) ||
      preloadedData[dataKey][
        Math.floor(Math.random() * preloadedData[dataKey].length)
      ];
    const uNum = parseInt(state.iceScore.urgency, 10);
    if (parseInt(state.iceScore.control, 10) > 3)
      suggestion = suggestion.replace(/trial|later/gi, "sign by Q2");
    if (uNum > 3) suggestion = suggestion.replace(/Q2|Q3|Q4/gi, "now");
    if (
      parseInt(state.iceScore.engagement, 10) < 3 &&
      parseInt(state.iceScore.engagement, 10) > 0
    )
      suggestion = suggestion.split("—")[0];
    suggestion = await getAiResponse(input);
    setAiSuggestion({ text: suggestion /*suggestion*/, type });
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    // console.log('ai', aiSuggestion.text);
    console.log("here", iceSteps[state.step].title);
    const actions = {
      "Handle NOs": {
        type: "SET_OBJECTION",
        payload: aiSuggestion.text, //aiSuggestion.text.split(" → ")[0],
      },
      "Win YESes": {
        type: "SET_PREP_INPUT",
        key: Object.keys(state.prepInputs)[state.step - 1] || "availability",
        payload: aiSuggestion.text,
      },
      "Fact Your Feelings": {
        type: "SET_FEELINGS",
        payload: aiSuggestion.text.split(" → ")[0],
      },
      "Targeted Thinking": {
        type: "SET_THINKING",
        payload: aiSuggestion.text.split("—")[0],
      },
      "Trigger Trust": {
        type: "SET_TRUST",
        payload: aiSuggestion.text.split("—")[0],
      },
      "Fuel It Forward": {
        type: "SET_FORWARD",
        payload: aiSuggestion.text.split("—")[0],
      },
    };
    dispatch(actions[aiSuggestion.type]);
    setAiSuggestion(null);
  };

  const dashboardData = {
    topObjections: state.objection ? [state.objection] : ["None logged"],
    successRate: state.result ? "75%" : "50%",
    coachingOpportunities: state.coachingTip
      ? [state.coachingTip]
      : ["Log more to analyze"],
  };

  const isPrepReady =
    state.prepInputs.availability &&
    state.prepInputs.financial &&
    state.prepInputs.decision;

  // console.log("aiSuggestion", aiSuggestion);
  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        ICE Cold Selling CRM
      </h1>
      <p className="mb-4">Plan for NO & Prep for YES</p>
      <p className="mb-4 text-blue-800 font-semibold">
        ICE = Impactful Clear Engagement: High-influence selling with precision
        and active connection — Artful Engagement for Lasting Sales Impact.
      </p>

      {state.showSummary ? (
        <div className="mb-4 p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold text-blue-800">Summary</h2>
          <div className="mt-4">
            <p>
              <strong>Contact:</strong> {state.contactName || "Not set"}
            </p>
            <p>
              <strong>ICEU Score:</strong> {formatIceScore(state.iceScore)}
            </p>
            <p>
              <strong>Guidance:</strong> {state.iceGuidance}
            </p>
            <h3 className="font-semibold mt-2">ICE Steps:</h3>
            {iceSteps.map((s, i) => (
              <p key={i}>
                <strong>{s.title}:</strong>{" "}
                {state.responses[s.title] ||
                  state.prepInputs[Object.keys(state.prepInputs)[i - 1]] ||
                  "Not provided"}
              </p>
            ))}
            <h3 className="font-semibold mt-2">Plan for NO:</h3>
            <p>
              <strong>Objection Flip:</strong> {state.objection || "None"}
            </p>
            <p>
              <strong>Coaching Tip:</strong>{" "}
              {state.coachingTip || "Cube for tips"}
            </p>
            {state.roleplayMode && (
              <>
                <p>
                  <strong>Roleplay:</strong> {state.roleplayResponse}
                </p>
                <p>
                  <strong>Your Response:</strong>{" "}
                  {state.userResponse || "Not provided"}
                </p>
                <p>
                  <strong>AI Suggestion:</strong>{" "}
                  {state.aiSuggestedResponse || "Awaiting feedback"}
                </p>
              </>
            )}
            <h3 className="font-semibold mt-2">Prep for YES:</h3>
            {Object.entries(state.prepInputs).map(([key, value]) => (
              <p key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                {value || "TBD"}
              </p>
            ))}
            <p>
              <strong>Result:</strong> {state.result || "No deal cubed"}
            </p>
            <p>
              <strong>Deal Score:</strong> {state.dealScore}
            </p>
            <h3 className="font-semibold mt-2">Pillars:</h3>
            <p>
              <strong>Fact Your Feelings:</strong> {state.feelings || "Not set"}
            </p>
            <p>
              <strong>Targeted Thinking:</strong> {state.thinking || "Not set"}
            </p>
            <p>
              <strong>Trigger Trust:</strong> {state.trust || "Not set"}
            </p>
            <p>
              <strong>Fuel It Forward:</strong> {state.forward || "Not set"}
            </p>
            <h3 className="font-semibold mt-2">Dashboard:</h3>
            <p>
              <strong>Top Objections:</strong>{" "}
              {dashboardData.topObjections.join(", ")}
            </p>
            <p>
              <strong>Success Rate:</strong> {dashboardData.successRate}
            </p>
            <p>
              <strong>Coaching:</strong>{" "}
              {dashboardData.coachingOpportunities.join(", ")}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SUMMARY" })}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold text-blue-800">
              {iceSteps[state.step].title}
            </h2>
            <p>{iceSteps[state.step].description}</p>
            {state.step === 0 ? (
              <textarea
                className="w-full p-2 border rounded mt-2"
                rows="3"
                value={state.responses[iceSteps[state.step].title] || ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_RESPONSE",
                    key: iceSteps[state.step].title,
                    payload: e.target.value,
                  })
                }
                placeholder={iceSteps[state.step].placeholder}
              />
            ) : (
              <div className="mt-2">
                {Object.keys(state.prepInputs).map((key, i) => (
                  <div key={key} className="step">
                    <h4>
                      {i + 1}. {key.charAt(0).toUpperCase() + key.slice(1)}
                    </h4>
                    <input
                      type="text"
                      value={state.prepInputs[key]}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PREP_INPUT",
                          key,
                          payload: e.target.value,
                        })
                      }
                      placeholder={`E.g., ${
                        key === "financial"
                          ? "PO or Credit Card?"
                          : key === "decision"
                          ? "Who signs?"
                          : "TBD"
                      }`}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                ))}
              </div>
            )}
            <button
              disabled={!handleHasResponse(
                state.responses[iceSteps[state.step].title]
              )}
              onClick={() =>
                getAiSuggestion(
                  state.responses[iceSteps[state.step].title] ||
                    state.prepInputs[
                      Object.keys(state.prepInputs)[state.step - 1]
                    ] ||
                    "",
                  iceSteps[state.step].title
                )
              }
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Get AI Suggestion
            </button>
            {aiSuggestion &&
              aiSuggestion.type === iceSteps[state.step].title && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handlePrevStep}
                disabled={state.step === 0}
                className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={state.step === iceSteps.length - 1}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={handleReset}
                disabled={state.step === iceSteps.length - 1}
                className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mb-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold text-blue-800">CRM Bolt-On</h2>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>ICEU Score (Decision Index)</h3>
              <input
                className="w-full p-2 border rounded mb-2"
                placeholder="Contact Name (e.g., Jane)"
                value={state.contactName}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CONTACT_NAME",
                    payload: e.target.value,
                  })
                }
              />
              <div className="flex flex-wrap justify-center gap-4 mb-2">
                <div className="text-center">
                  <label className="block text-sm font-semibold mb-1">
                    Influence (1-5)
                  </label>
                  <select
                    value={state.iceScore.influence}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ICE_SCORE",
                        key: "influence",
                        payload: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option value="0">0</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-semibold mb-1">
                    Control (1-5)
                  </label>
                  <select
                    value={state.iceScore.control}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ICE_SCORE",
                        key: "control",
                        payload: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option value="0">0</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-semibold mb-1">
                    Engagement (1-5, Optional)
                  </label>
                  <select
                    value={state.iceScore.engagement}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ICE_SCORE",
                        key: "engagement",
                        payload: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option value="0">0</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-semibold mb-1">
                    Urgency (1-5, Optional)
                  </label>
                  <select
                    value={state.iceScore.urgency}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ICE_SCORE",
                        key: "urgency",
                        payload: e.target.value,
                      })
                    }
                    className="p-2 border rounded"
                  >
                    <option value="0">0</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-blue-700">{state.iceGuidance}</p>
              <div className="mt-4 text-sm">
                <div>
                  <h4 className="font-semibold">Influence (1-5) Guide</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-1">I</th>
                        <th className="border border-gray-400 p-1">Rating</th>
                        <th className="border border-gray-400 p-1">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-1">0</td>
                        <td className="border border-gray-400 p-1">Not Set</td>
                        <td className="border border-gray-400 p-1">
                          Unknown influence—role unclear
                        </td>
                        <td className="border border-gray-400 p-1">
                          Probe role
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">1-2</td>
                        <td className="border border-gray-400 p-1">Low Sway</td>
                        <td className="border border-gray-400 p-1">
                          Limited impact—bystander or junior
                        </td>
                        <td className="border border-gray-400 p-1">
                          Find their boss
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">3-5</td>
                        <td className="border border-gray-400 p-1">
                          Key Player
                        </td>
                        <td className="border border-gray-400 p-1">
                          High impact—shapes decisions
                        </td>
                        <td className="border border-gray-400 p-1">
                          Address their needs
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">Control (1-5) Guide</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-1">C</th>
                        <th className="border border-gray-400 p-1">Rating</th>
                        <th className="border border-gray-400 p-1">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-1">0</td>
                        <td className="border border-gray-400 p-1">Not Set</td>
                        <td className="border border-gray-400 p-1">
                          Unknown control—authority unclear
                        </td>
                        <td className="border border-gray-400 p-1">
                          Probe authority
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">1-2</td>
                        <td className="border border-gray-400 p-1">
                          Gatekeeper
                        </td>
                        <td className="border border-gray-400 p-1">
                          Limited say—blocks or filters
                        </td>
                        <td className="border border-gray-400 p-1">
                          Bypass or charm
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">3-5</td>
                        <td className="border border-gray-400 p-1">Decider</td>
                        <td className="border border-gray-400 p-1">
                          Final say—owns the YES
                        </td>
                        <td className="border border-gray-400 p-1">
                          Earn their YES
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">
                    Engagement (1-5, Optional) Approach
                  </h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-1">E</th>
                        <th className="border border-gray-400 p-1">Style</th>
                        <th className="border border-gray-400 p-1">Approach</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-1">0</td>
                        <td className="border border-gray-400 p-1">Unknown</td>
                        <td className="border border-gray-400 p-1">
                          Neutral—probe
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">1-2</td>
                        <td className="border border-gray-400 p-1">Quiet</td>
                        <td className="border border-gray-400 p-1">
                          Short, facts
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">3</td>
                        <td className="border border-gray-400 p-1">Moderate</td>
                        <td className="border border-gray-400 p-1">
                          Clear, balanced
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">4-5</td>
                        <td className="border border-gray-400 p-1">
                          Talkative
                        </td>
                        <td className="border border-gray-400 p-1">
                          Warm, chatty
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">
                    Urgency (1-5, Optional) Guide
                  </h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-1">U</th>
                        <th className="border border-gray-400 p-1">Rating</th>
                        <th className="border border-gray-400 p-1">
                          Description
                        </th>
                        <th className="border border-gray-400 p-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-1">0</td>
                        <td className="border border-gray-400 p-1">Not Set</td>
                        <td className="border border-gray-400 p-1">
                          Unknown urgency—timeline unclear
                        </td>
                        <td className="border border-gray-400 p-1">
                          Probe timeline
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">1</td>
                        <td className="border border-gray-400 p-1">No Rush</td>
                        <td className="border border-gray-400 p-1">
                          Far-off need—low priority
                        </td>
                        <td className="border border-gray-400 p-1">
                          Nudge later
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">2</td>
                        <td className="border border-gray-400 p-1">
                          Low Urgency
                        </td>
                        <td className="border border-gray-400 p-1">
                          Some interest—months away
                        </td>
                        <td className="border border-gray-400 p-1">
                          Schedule follow-up
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">3</td>
                        <td className="border border-gray-400 p-1">
                          Moderate Urgency
                        </td>
                        <td className="border border-gray-400 p-1">
                          Near-term need—weeks/months
                        </td>
                        <td className="border border-gray-400 p-1">
                          Push gently
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">4</td>
                        <td className="border border-gray-400 p-1">
                          High Urgency
                        </td>
                        <td className="border border-gray-400 p-1">
                          Tight timeline—days/weeks
                        </td>
                        <td className="border border-gray-400 p-1">Act fast</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-1">5</td>
                        <td className="border border-gray-400 p-1">
                          Now or Never
                        </td>
                        <td className="border border-gray-400 p-1">
                          Immediate need—hours/days
                        </td>
                        <td className="border border-gray-400 p-1">
                          Close now
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Fact Your Feelings</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={state.feelings}
                onChange={(e) =>
                  dispatch({ type: "SET_FEELINGS", payload: e.target.value })
                }
                placeholder="E.g., 'Fear of cost'"
              />
              <button
                onClick={() =>
                  getAiSuggestion(state.feelings, "Fact Your Feelings")
                }
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Get AI Suggestion
              </button>
              {aiSuggestion && aiSuggestion.type === "Fact Your Feelings" && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Targeted Thinking</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={state.thinking}
                onChange={(e) =>
                  dispatch({ type: "SET_THINKING", payload: e.target.value })
                }
                placeholder="E.g., 'Plan next step'"
              />
              <button
                onClick={() =>
                  getAiSuggestion(state.thinking, "Targeted Thinking")
                }
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Get AI Suggestion
              </button>
              {aiSuggestion && aiSuggestion.type === "Targeted Thinking" && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Trigger Trust</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={state.trust}
                onChange={(e) =>
                  dispatch({ type: "SET_TRUST", payload: e.target.value })
                }
                placeholder="E.g., 'Prove reliability'"
              />
              <button
                onClick={() => getAiSuggestion(state.trust, "Trigger Trust")}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Get AI Suggestion
              </button>
              {aiSuggestion && aiSuggestion.type === "Trigger Trust" && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Fuel It Forward</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={state.forward}
                onChange={(e) =>
                  dispatch({ type: "SET_FORWARD", payload: e.target.value })
                }
                placeholder="E.g., 'Next nudge'"
              />
              <button
                onClick={() =>
                  getAiSuggestion(state.forward, "Fuel It Forward")
                }
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Get AI Suggestion
              </button>
              {aiSuggestion && aiSuggestion.type === "Fuel It Forward" && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Objection Flip</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="2"
                value={state.objection}
                onChange={(e) =>
                  dispatch({ type: "SET_OBJECTION", payload: e.target.value })
                }
                placeholder="E.g., 'Too pricey'"
              />
              <button
                onClick={() => getAiSuggestion(state.objection, "Handle NOs")}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Get AI Suggestion
              </button>
              {aiSuggestion && aiSuggestion.type === "Handle NOs" && (
                <div className="mt-2">
                  <p className="text-blue-700">
                    Suggestion: "{aiSuggestion.text}"
                  </p>
                  <button
                    onClick={applyAiSuggestion}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Coaching Tips</h3>
              <p>{state.coachingTip || "Cube a deal for tips!"}</p>
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>AI Roleplay</h3>
              {state.roleplayMode ? (
                <>
                  <p>{state.roleplayResponse}</p>
                  <textarea
                    className="w-full p-2 border rounded mt-2"
                    rows="3"
                    value={state.userResponse}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_USER_RESPONSE",
                        payload: e.target.value,
                      })
                    }
                    placeholder="Type your response..."
                  />
                  <button
                    onClick={handleUserResponse}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Get AI Feedback
                  </button>
                  {state.aiSuggestedResponse && (
                    <p className="mt-2 text-blue-700">
                      {state.aiSuggestedResponse}
                    </p>
                  )}
                </>
              ) : (
                <button
                  onClick={handleRoleplay}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Start Roleplay
                </button>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Prep for YES</h3>
              <div className="step">
                <h4>1. Availability</h4>
                <p>Stock: {state.prepInputs.availability || "Checking..."}</p>
                <button
                  onClick={checkStock}
                  className="bg-blue-500 text-white px-2 py-1 rounded mt-1"
                >
                  Check Now
                </button>
              </div>
              {["financial", "decision", "timing", "support"].map((key, i) => (
                <div key={key} className="step">
                  <h4>
                    {i + 2}. {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h4>
                  <input
                    type="text"
                    value={state.prepInputs[key]}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PREP_INPUT",
                        key,
                        payload: e.target.value,
                      })
                    }
                    placeholder={`E.g., ${
                      key === "financial"
                        ? "PO or Credit Card?"
                        : key === "decision"
                        ? "Who signs?"
                        : "TBD"
                    }`}
                    className="w-full p-1 border rounded"
                  />
                </div>
              ))}
              <button
                onClick={cubeDeal}
                disabled={!isPrepReady}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
              >
                Cube the YES
              </button>
              {state.result && (
                <p className="mt-2 text-green-700 font-bold">{state.result}</p>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Deal Health Scoring</h3>
              <p>
                <strong>Deal Score: {state.dealScore}</strong>
              </p>
            </div>

            <div className="mb-4 p-4 bg-gray-200 rounded">
              <h3>Dashboard</h3>
              <button
                onClick={() => dispatch({ type: "TOGGLE_DASHBOARD" })}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {state.showDashboard ? "Hide" : "View"} Dashboard
              </button>
              {state.showDashboard && (
                <div className="mt-4 p-4 bg-white rounded">
                  <p>
                    <strong>Top Objections:</strong>{" "}
                    {dashboardData.topObjections.join(", ")}
                  </p>
                  <p>
                    <strong>Success Rate:</strong> {dashboardData.successRate}
                  </p>
                  <p>
                    <strong>Coaching:</strong>{" "}
                    {dashboardData.coachingOpportunities.join(", ")}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => dispatch({ type: "TOGGLE_SUMMARY" })}
              className="bg-purple-500 text-white px-4 py-2 rounded w-full"
            >
              View Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
