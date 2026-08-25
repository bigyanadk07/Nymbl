// market/url-analyzer/url-analyzer.service.js

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

/**
 * Analyzes the structure of a URL string.
 *
 * Assumes `urlString` has already been validated as a parseable
 * URL by the controller layer. Does not make any network request.
 */
const analyzeUrl = (urlString) => {

  const parsed = new URL(urlString);


  // ----------------------------------------------------------
  // Protocol
  // ----------------------------------------------------------

  // URL.protocol includes the trailing colon, e.g. "https:"
  const protocol = parsed.protocol.replace(':', '');


  // ----------------------------------------------------------
  // Port
  //
  // parsed.port is '' when no port was explicitly specified
  // (even for the protocol's default port, e.g. :443 on https).
  // ----------------------------------------------------------

  const port =
    parsed.port !== ''
      ? Number(parsed.port)
      : null;


  // ----------------------------------------------------------
  // Domain / subdomain detection
  //
  // Naive label-count heuristic: treats anything beyond the
  // last two dot-separated labels as a subdomain. This does
  // NOT correctly handle multi-part public suffixes such as
  // "co.uk" or "com.np" (e.g. "shop.example.co.uk" would be
  // read as domain "co.uk" with subdomain "shop.example").
  // IP-address hostnames are treated as having no subdomain.
  // ----------------------------------------------------------

  const hostname = parsed.hostname;

  let domain;
  let hasSubdomain;

  if (IPV4_REGEX.test(hostname)) {

    domain = hostname;
    hasSubdomain = false;

  } else {

    const labels = hostname.split('.');

    domain =
      labels.length >= 2
        ? labels.slice(-2).join('.')
        : hostname;

    hasSubdomain = labels.length > 2;

  }


  // ----------------------------------------------------------
  // Query parameters
  // ----------------------------------------------------------

  const queryParameters = Object.fromEntries(parsed.searchParams);

  const queryParameterCount = Object.keys(queryParameters).length;


  // ----------------------------------------------------------
  // Fragment
  // ----------------------------------------------------------

  // parsed.hash includes the leading '#', e.g. "#section"
  const fragment =
    parsed.hash !== ''
      ? parsed.hash.slice(1)
      : null;


  return {
    originalUrl: urlString,
    protocol,
    hostname,
    port,
    domain,
    path: parsed.pathname,
    queryParameters,
    queryParameterCount,
    usesHttps: protocol === 'https',
    hasSubdomain,
    fragment,
    length: urlString.length
  };

};

module.exports = {
  analyzeUrl
};