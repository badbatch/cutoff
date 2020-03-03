import { ReleaseTag } from "../../types";

const RELEASE_TAGS = ["alpha", "beta", "unstable"];

export default function isValidReleaseTag(tag: ReleaseTag) {
  return RELEASE_TAGS.includes(tag);
}
