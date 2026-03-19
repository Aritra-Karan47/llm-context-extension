from bs4 import BeautifulSoup, NavigableString
import markdownify

def html_to_markdown(html: str, url: str = "") -> dict:
    """Core conversion logic – ready for future chunking/LLM pipeline"""
    if len(html) > 5_242_880:  # 5MB hard limit
        raise ValueError("HTML payload too large")

    soup = BeautifulSoup(html, "lxml")

    # Aggressive cleaning (same as client-side + extra safety)
    for tag in soup(["script", "style", "noscript", "iframe", "svg", "canvas", "link"]):
        tag.decompose()

    # Remove all event handlers & data-* attributes
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.startswith("on") or attr.startswith("data-"):
                del tag[attr]

    markdown = markdownify.markdownify(
        str(soup),
        heading_style="ATX",
        bullets="-",
        escape_underscores=False,
        strip=["img"]  # keep alt text only for now
    )

    return {
        "markdown": markdown.strip(),
        "title": soup.title.string.strip() if soup.title else "Untitled Page",
        "word_count": len(markdown.split()),
        "url": url
    }