import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MdClear, MdRefresh, MdCheck } from 'react-icons/md';

import css from './Ingredient.css';
import DiffText from '../DiffText';

export default class Ingredient extends Component {
  static displayName = 'Ingredient';

  static propTypes = {
    ingredient: PropTypes.object.isRequired,
    ingredientMods: PropTypes.arrayOf(PropTypes.object),
    editing: PropTypes.bool,
    removed: PropTypes.bool,
    removeAction: PropTypes.func,
    restoreAction: PropTypes.func,
    handleIngredientChange: PropTypes.func,
    setEditingId: PropTypes.func
  };

  static defaultProps = {
    ingredientMods: [],
    editing: false,
    removed: false
  };

  ingredientFields = ['quantity', 'unit', 'name', 'processing'];

  ingredientRef = React.createRef();

  getIngredientValue = fieldName => {
    const { ingredient, ingredientMods } = this.props;

    const mod = ingredientMods.find(
      mod => mod.ingredientId === ingredient._id && mod.field === fieldName
    );

    return mod !== undefined ? mod.value : ingredient[fieldName];
  };

  renderRemovedIngredient = () => {
    const { ingredient } = this.props;
    const removedIngredient = [];

    this.ingredientFields.forEach(fieldName => {
      if (ingredient[fieldName])
        removedIngredient.push(
          'name' === fieldName && ingredient['processing']
            ? ingredient[fieldName] + ','
            : ingredient[fieldName]
        );
    });

    return <del>{removedIngredient.join(' ')}</del>;
  };

  renderIngredientWithMods = () => {
    const { ingredient, ingredientMods } = this.props;

    const original = this.ingredientFields
      .reduce((result, fieldName) => {
        let value = ingredient[fieldName];
        if (value) {
          value += fieldName === 'name' && ingredient['processing'] ? ',' : '';
          result.push(value);
        }
        return result;
      }, [])
      .join(' ');

    if (ingredientMods.length === 0) return <span>{original}</span>;

    const modified = this.ingredientFields
      .reduce((result, fieldName) => {
        let value = this.getIngredientValue(fieldName);
        if (value) {
          value +=
            fieldName === 'name' && this.getIngredientValue('processing')
              ? ','
              : '';
          result.push(value);
        }
        return result;
      }, [])
      .join(' ');

    return <DiffText original={original} modified={modified} />;
  };

  deselect = () => {
    this.props.setEditingId(null);
    document.removeEventListener('mousedown', this.handleClick);
  };

  handleClick = e => {
    if (this.ingredientRef.current.contains(e.target)) return;
    this.deselect();
  };

  handleSave = e => {
    e.stopPropagation();
    this.deselect();
  };

  handleSelect = e => {
    e.stopPropagation();
    document.addEventListener('mousedown', this.handleClick);
    this.props.setEditingId(this.props.ingredient._id);
  };

  handleRemove = e => {
    e.stopPropagation();
    this.props.removeAction(this.props.ingredient);
  };

  handleRestore = e => {
    e.stopPropagation();
    this.props.restoreAction(this.props.ingredient);
  };

  render() {
    const { ingredient, editing, removed, handleIngredientChange } = this.props;

    return (
      <li
        className={css.ingredient}
        data-editing={editing}
        onClick={this.handleSelect}
        ref={this.ingredientRef}
      >
        {editing ? (
          <fieldset>
            <input
              name="quantity"
              value={this.getIngredientValue('quantity')}
              placeholder={ingredient.quantity ? ingredient.quantity : 'Qty'}
              onChange={handleIngredientChange}
            />
            <input
              name="unit"
              value={this.getIngredientValue('unit')}
              placeholder={ingredient.unit ? ingredient.unit : 'Unit'}
              onChange={handleIngredientChange}
            />
            <input
              name="name"
              value={this.getIngredientValue('name')}
              placeholder={ingredient.name ? ingredient.name : 'Name'}
              onChange={handleIngredientChange}
            />
            <input
              name="processing"
              value={this.getIngredientValue('processing')}
              placeholder={
                ingredient.processing ? ingredient.processing : 'Process'
              }
              onChange={handleIngredientChange}
            />
          </fieldset>
        ) : (
          <div className={css.ingredientText}>
            {removed
              ? this.renderRemovedIngredient()
              : this.renderIngredientWithMods()}
          </div>
        )}

        <div className={css.buttons}>
          {removed && !editing && (
            <button
              aria-label="restore ingredient"
              onClick={this.handleRestore}
            >
              <MdRefresh />
            </button>
          )}

          {!removed && !editing && (
            <button aria-label="remove ingredient" onClick={this.handleRemove}>
              <MdClear />
            </button>
          )}

          {editing && (
            <button aria-label="save modifications" onClick={this.handleSave}>
              <MdCheck />
            </button>
          )}
        </div>
      </li>
    );
  }
}
