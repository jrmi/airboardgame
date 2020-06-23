import React from "react";
import recoil from "recoil";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    //logOwnerReasons: true,
    trackExtraHooks: [
      [recoil, "useRecoilState", "useRecoilValue", "useSetRecoilState"],
    ],
  });
}
