// JSON-LD in the server HTML. `<` is escaped so a string cannot close the script tag.
export const JsonLd = ({ data }: { data: object }) => (
  <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
)
