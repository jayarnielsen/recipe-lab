import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { MdEdit, MdClear, MdCheck, MdRefresh } from 'react-icons/md';
import classnames from 'classnames';
import Textarea from '../Textarea';
import RecipeContext from '../../context/RecipeContext';
import {
  removeStep,
  undoRemoval,
  setAlteration
} from '../../actions/modification';
import {
  areAllFieldsEmpty,
  getFieldValue,
  renderFieldWithMods
} from '../../utils/recipe';
import TextButton from '../TextButton';
import TextButtonGroup from '../TextButtonGroup';
import css from './Step.css';

const Step = ({ index, itemId, step, children }) => {
  const stepFields = ['directions'];
  const {
    modification: { alterations, removals },
    modificationDispatch
  } = useContext(RecipeContext);
  const isRemoved = useMemo(
    () => removals.some(sourceId => [itemId, step.uid].includes(sourceId)),
    [removals]
  );
  const [hovering, setHovering] = useState(false);
  const [edits, setEdits] = useState({});
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(
    areAllFieldsEmpty(stepFields, step, alterations)
  );

  const stepRef = useRef();
  const inputRef = useRef();
  const validationTimeouts = useRef({});

  const restoreStep = () =>
    undoRemoval([itemId, step.uid], modificationDispatch);

  const getStepValue = fieldName =>
    getFieldValue(fieldName, step, alterations, edits);

  const handleClick = e => {
    if (!stepRef.current) return;
    if (stepRef.current.contains(e.target)) return;
    setEditing(false);
  };

  const mouseEnter = () => {
    setHovering(true);
  };

  const mouseLeave = () => {
    setHovering(false);
  };

  const saveEdits = () => {
    Object.entries(edits)
      .filter(([key]) => validate(key, getStepValue(key)))
      .forEach(([key, value]) => {
        setAlteration(step, key, value, modificationDispatch);
        delete edits[key];
        setEdits(edits);
      });
  };

  const handleSave = e => {
    e.preventDefault();
    saveEdits();
    setEditing(false);
  };

  const handleRemove = e => {
    e.stopPropagation();
    removeStep(step, modificationDispatch);
  };

  const handleRestore = e => {
    e.stopPropagation();
    restoreStep();
  };

  const validate = (fieldName, value) => {
    let err = undefined;

    switch (fieldName) {
      case 'directions':
        if (value.length < 3 || value.length > 500)
          err = 'Directions must be between 3 and 500 characters';
        break;
    }

    setErrors(errors => ({
      ...errors,
      [fieldName]: err
    }));

    return Boolean(!err);
  };

  const handleStepChange = e => {
    const { name, value } = e.target;
    if (isRemoved) undoRemoval([itemId, step.uid], modificationDispatch);

    if (validationTimeouts.current[name])
      clearTimeout(validationTimeouts.current[name]);

    setEdits({
      ...edits,
      [name]: value
    });

    validationTimeouts.current[name] = setTimeout(() => {
      validate(name, value);
      delete validationTimeouts.current[name];
    }, 1000);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSave(e);
      return;
    }
  };

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
      inputRef.current.selectionStart = getStepValue('directions').length;
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
      if (areAllFieldsEmpty(stepFields, step, alterations))
        removeStep(step, modificationDispatch);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [editing]);

  return (
    <Draggable type={`STEP-${itemId}`} draggableId={step.uid} index={index}>
      {(provided, snapshot) => (
        <li
          className={css.container}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div
            className={classnames(css.step, {
              [css.hover]: hovering,
              [css.editing]: editing,
              [css.dragging]: snapshot.isDragging
            })}
          >
            <div
              onMouseOver={mouseEnter}
              onMouseLeave={mouseLeave}
              className={css.stepNum}
              {...provided.dragHandleProps}
            >
              Step {index + 1}
            </div>

            <div className={css.stepContents}>
              <form className={css.directions} ref={stepRef}>
                {editing && (
                  <Textarea
                    inputRef={inputRef}
                    name="directions"
                    value={getStepValue('directions')}
                    placeholder="Directions"
                    onChange={handleStepChange}
                    error={errors.directions}
                    onKeyDown={handleKeyPress}
                  />
                )}

                {!editing && (
                  <p
                    className={classnames(css.stepDirections, {
                      [css.error]: errors.directions
                    })}
                    onMouseDown={() => setEditing(true)}
                  >
                    {renderFieldWithMods(
                      'directions',
                      step,
                      alterations,
                      isRemoved,
                      edits,
                      errors
                    )}
                  </p>
                )}

                <div className={css.stepActions}>
                  <TextButtonGroup className={css.buttons}>
                    {editing && (
                      <TextButton onClick={handleSave}>
                        <MdCheck /> save directions
                      </TextButton>
                    )}

                    {!editing && !isRemoved && (
                      <TextButton
                        title="edit directions"
                        onClick={() => setEditing(true)}
                      >
                        <MdEdit /> edit directions
                      </TextButton>
                    )}

                    {!isRemoved && !editing && (
                      <TextButton onClick={handleRemove}>
                        <MdClear /> remove step
                      </TextButton>
                    )}

                    {isRemoved && !editing && (
                      <TextButton onClick={handleRestore}>
                        <MdRefresh /> restore step
                      </TextButton>
                    )}
                  </TextButtonGroup>
                </div>
              </form>

              <div>{children}</div>
            </div>
          </div>
        </li>
      )}
    </Draggable>
  );
};

Step.propTypes = {
  index: PropTypes.number,
  itemId: PropTypes.string,
  step: PropTypes.object,
  children: PropTypes.node
};

export default Step;
