import React from 'react';
import styles from './Bars.module.scss';
import PropTypes from 'prop-types';

export function HBar({ className = '' }) {
  return <div className={`${styles.h_bar} ${className}`}></div>;
}