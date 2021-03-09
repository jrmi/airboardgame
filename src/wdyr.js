import React from "react";
import recoil from "recoil";
import whyDidYouRender from "@welldone-software/why-did-you-render";

if (import.meta.env.DEV) {
  console.log("Activate WDYR...");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    //logOwnerReasons: true,
    trackExtraHooks: [
      [recoil, "useRecoilState", "useRecoilValue", "useSetRecoilState"],
    ],
  });
}
