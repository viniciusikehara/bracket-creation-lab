import { ScreenStub } from './Placeholder'

export function BracketScreen() {
  return (
    <ScreenStub title="Bracket" description="The live bracket: click a match to record its result.">
      {/*
        The bracket is the one genuinely wide thing in the app. It gets its own
        horizontal scroll container so a phone scrolls the bracket, never the page.
      */}
      <div className="scroll-x">
        <div className="bracket-placeholder">Bracket rounds will render here, scrollable on narrow screens.</div>
      </div>
    </ScreenStub>
  )
}
