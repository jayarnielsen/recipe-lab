import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DiffMatchPatch from 'diff-match-patch';

import css from './DiffText.css';

export default class DiffText extends PureComponent {
  static displayName = 'DiffText';
  static propTypes = {
    original: PropTypes.string,
    modified: PropTypes.string
  };

  render() {
    const { original, modified } = this.props;
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(original, modified);
    dmp.diff_cleanupSemantic(diff);
    return (
      <span aria-label={modified} className={css.diffText}>
        {diff.reduce((result, match, i) => {
          const text = match[1].trim();
          const hasPunctuation = text.match(/^[.,:;!?]/);
          if (!hasPunctuation && i > 0) result.push(' ');
          switch (match[0]) {
            case 1:
              result.push(
                <ins aria-hidden="true" key={i}>
                  {text}
                </ins>
              );
              break;
            case -1:
              result.push(
                <del aria-hidden="true" key={i}>
                  {text}
                </del>
              );
              break;
            default:
              result.push(
                <span aria-hidden="true" key={i}>
                  {text}
                </span>
              );
          }
          return result;
        }, [])}
      </span>
    );
  }
}
