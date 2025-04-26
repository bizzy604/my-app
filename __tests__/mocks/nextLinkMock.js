// Mock for next/link

// Mock the Next.js Link component as a simple function
const NextLinkMock = function(props) {
  return {
    type: 'a',
    props: {
      ...props,
      href: props.href || '#',
      'data-testid': 'next-link',
      children: props.children
    }
  };
};

// Export as both default and named export to cover all use cases
module.exports = NextLinkMock;
module.exports.default = NextLinkMock;
