"use client";

import { useEffect } from "react";

interface AdverticaAdProps {
  className?: string;
  dataAffquery: string;
}

export default function Advert({ className = "", dataAffquery }: AdverticaAdProps) {

  useEffect(() => {
    const container = document.getElementById("ad-container-"+className);
    if (container) {
      container.innerHTML = `
        <ins style="width:0px;height:0px"
             data-width="0"
             data-height="0"
             class="${className}"
             data-domain="//data684.click"
             data-affquery="${dataAffquery}">
          <script src="//data684.click/js/responsive.js" async></script>
        </ins>
      `;
    }
  }, []);

  return (
    <div id={"ad-container-"+className}></div>
  );
}