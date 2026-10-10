// Boot intro terminal, scroll progress bar and cursor glow. Driven by
// useLandingEffects via the #boot, #bootlines, #progress and #cursor ids.
export default function Overlays() {
  return (
    <>
      <div id="boot">
        <div className="term">
          <div className="head"><span className="glyph">B</span> BYTE SIZED CO. // boot</div>
          <pre id="bootlines" style={{ fontFamily: "inherit", whiteSpace: "pre-wrap", margin: 0 }}></pre>
        </div>
        <div className="skip">click to skip</div>
      </div>

      <div id="progress" />
      <div id="cursor" />
    </>
  );
}
