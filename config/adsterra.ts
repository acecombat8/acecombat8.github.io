// Current site's Adsterra ad-unit configuration.
// Keep the official snippets verbatim, including their script attributes.
export const adsterra = {
  desktopBanner: `<script>
  atOptions = {
    'key' : '60b832724032c92303b2a5750d444899',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/60b832724032c92303b2a5750d444899"></script>`,
  mobileBanner: `<script>
  atOptions = {
    'key' : '3b3e56b42cbf551ee33d979dd7703a73',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/3b3e56b42cbf551ee33d979dd7703a73"></script>`,
  nativeBanner: `<script async="async" data-cfasync="false" src="https://bauval.org/21/cffb6e524846cd974b1fec90d1fe078b"></script>
<div id="container-cffb6e524846cd974b1fec90d1fe078b"></div>`,
  socialBar: {
    src: "https://bauval.org/14/fbd74db1d44a9115cbe195159f43f20d",
    "data-cfasync": "false",
  },
} as const;
