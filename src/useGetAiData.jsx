import React, { useEffect, useState } from "react";
import getAiResponse from "./apiData";

export function useGetAiData() {
  const [data, setData] = useState("");
  const [request, setRequest] = useState("");

  // console.log("request", request);
  // console.log("data", data);
  useEffect(() => {
    (async () => {
      const __data = await getAiResponse(request);
      // console.log("--", __data);
      setData(__data);
    })();
  }, [request]);

  return { aiResponse: data, setRequest };
}
