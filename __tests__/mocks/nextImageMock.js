// Mock for next/image

// Mock the Next.js Image component as a simple function
const NextImageMock = function(props) {
  return {
    type: 'img',
    props: {
      ...props,
      src: props.src || '',
      alt: props.alt || '',
      'data-testid': 'next-image'
    }
  };
};

// Export as both default and named export to cover all use cases
module.exports = NextImageMock;
module.exports.default = NextImageMock;
