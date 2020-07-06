import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import clsx from 'clsx';
import validate from 'validate.js';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Switch,
  Avatar,
  colors
} from '@material-ui/core';
import { DropzoneDialog } from 'material-ui-dropzone'
import axios from 'utils/axios';
import { useDropzone } from 'react-dropzone'
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    height: 400
  },
  formGroup: {
    marginBottom: theme.spacing(3)
  },
  fieldGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  textField: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  },
  actions: {
    backgroundColor: colors.grey[100],
    paddingTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-start'
  },
  avatar: {
    height: 72,
    width: 72,
    marginRight: theme.spacing(1)
  }
}));

const schema = {
  fullName: {
    presence: { allowEmpty: false, message: '^Nome é obrigatório' }
  },
  documentType: {
    presence: { allowEmpty: false, message: '^Tipo é obrigatório' }
  }
};

const options = [
  {
    value: 'txt',
    label: 'txt'
  },
  {
    value: 'pdf',
    label: 'pdf'
  },
  {
    value: 'docx',
    label: 'docx'
  },
  {
    value: 'png',
    label: 'png'
  },
  {
    value: 'jpeg',
    label: 'jpeg'
  },
];

var file;

const DocumentForm = props => {
  const { document, onSubmit, className, ...rest } = props;

  const [formState, setFormState] = useState({
    isValid: false,
    values: { ...document },
    touched: {},
    errors: {}
  });

  const classes = useStyles();

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}
    }));
  }, [formState.values]);

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleTypeChange = async option => {
    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        documentType: option.value
      },
      touched: {
        ...formState.touched,
        documentType: true
      }
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    file = null;
    onSubmit(formState.values);
  };

  const onDrop = useCallback(acceptedFiles => {
    const data = new FormData();
    data.append('file', acceptedFiles[0]);

    console.log(acceptedFiles);

    axios({
      method: 'POST',
      url: '/api/v1/document/upload',
      data: data
    })
    .then(response => {
      setFormState(formState => ({
        ...formState,
        values: {
          ...formState.values,
          doc: response.data
        },
        touched: {
          ...formState.touched,
          thumbnail: true
        }
      }));
    }).catch((error) => {
    });

    file = acceptedFiles[0].name;
    const path = file;
    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        directory: path
      },
      touched: {
        ...formState.touched,
        thumbnail: true
      }
    }))
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      onSubmit={handleSubmit}
    >
      <Card
        {...rest}
        className={clsx(classes.root, className)}>
        <CardHeader title="Dados do documento" action={<Switch
          checked={formState.values.active}
          onChange={handleChange}
          name="active"
          inputProps={{ 'aria-label': 'secondary checkbox' }}
        />} />
        <CardContent>
          <div className={classes.formGroup}>
            <TextField
              size="small"
              autoFocus
              fullWidth
              className={classes.textField}
              error={hasError('fullName')}
              helperText={hasError('fullName') ? formState.errors.fullName[0] : null}
              label="Nome"
              onChange={handleChange}
              name="fullName"
              //value={formState.values.fullName}
              variant="outlined"
            />
          </div>

          <div className={classes.formGroup}>
            <Select
              size="small"
              fullWidth
              placeholder="Tipo"
              options={options}
              //defaultInputValue={formState.values.documentType.displayType}
              onChange={handleTypeChange}
            />
          </div>

          {/* <div className={classes.formGroup}>
            <TextField
              size="small"
              fullWidth
              className={classes.textField}
              error={hasError('directory')}
              helperText={hasError('directory') ? formState.errors.directory[0] : null}
              label="Diretório"
              onChange={handleChange}
              name="directory"
              //value={formState.values.directory}
              variant="outlined"
            />
          </div> */}

          <div className={classes.formGroup}>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>{file ? file : "Drag 'n' drop some files here, or click to select files"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className={classes.actions}>
        <Button
          disabled={!formState.isValid}
          type="submit"
        >
          Salvar alterações
        </Button>
      </div>
    </form>
  );
};

DocumentForm.propTypes = {
  document: PropTypes.object.isRequired,
  className: PropTypes.string
};

export default DocumentForm;