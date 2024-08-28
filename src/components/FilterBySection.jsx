import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de';
import dayjs from 'dayjs';

function FilterBySection({
  setFilteredDate,
  filteredTags,
  setFilteredTags,
  filteredStoryType,
  setFilteredStoryType,
  isMobile,
}) {
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const tags = [
    'Techcrunch',
    'The Verge',
    'MIT Technology Review',
    'Bloomberg',
    'Artificial Intelligence',
  ];

  const handleInitialDateChange = (selectedDate) => {
    console.log(selectedDate);
    const dayjsObject = dayjs(selectedDate);
    const formattedDate = dayjsObject.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const parsedDate = dayjs(formattedDate);
    const timestampInSeconds = parsedDate.unix();
    setInitialDate(timestampInSeconds);
  };

  const handleFinalDateChange = (selectedDate) => {
    console.log(selectedDate);
    const dayjsObject = dayjs(selectedDate);
    const formattedDate = dayjsObject.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const parsedDate = dayjs(formattedDate);
    const timestampInSeconds = parsedDate.unix();
    setFinalDate(timestampInSeconds);
  };

  const toggleTagFilter = (tag) => {
    if (filteredTags.includes(tag)) {
      setFilteredTags(filteredTags.replace(tag, '').replace('  ', ''));
      return;
    }
    setFilteredTags(filteredTags + tag + ' ');
  };

  const storyTipes = [{name:"All Stories", value:"All Stories"}, {name:"Show HN", value:"Show HN"}, {name:"Ask HN", value:"Ask HN"}]

  return (
    <>
      <div className="arrow-up-filterby"></div>
      <div className="filters-container">
        <div className='my-2'>
          <span className='py-2'>Filter by story type: </span>
          <ButtonGroup className="mb-2 ms-2 mt-2">
            {storyTipes.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant="outline-light"
                name="radio"
                className="filter-by-story-type-radio"
                value={radio.value}
                checked={filteredStoryType === radio.value}
                onChange={(e) => setFilteredStoryType(e.currentTarget.value)}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </div>
        <hr />
        <div className="filter-by-date-container">
          <span className="my-auto">
            {!isMobile && 'Filter by date: '} From
          </span>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <DateTimePicker
              label="Initial Date"
              disableFuture={true}
              onAccept={handleInitialDateChange}
            />
          </LocalizationProvider>
          <br />
          <span className="my-auto">to</span>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <DateTimePicker
              label="Final Date"
              disableFuture={true}
              onAccept={handleFinalDateChange}
            />
          </LocalizationProvider>
          <Button
            variant="light"
            className="apply-button my-auto"
            onClick={() => {
              setFilteredDate(
                `&numericFilters=created_at_i>${initialDate},created_at_i<${finalDate}`
              );
            }}
          >
            Apply
          </Button>
        </div>
        <hr />
        <span className="my-auto me-2">Filter by tags:</span>
        {tags.map((tag) => {
          return (
            <Button
              variant={filteredTags.includes(tag) ? 'light' : 'outline-light'}
              className={
                'filter-tags ' +
                (filteredTags.includes(tag) ? 'active-filter-tag ' : '')
              }
              onClick={(e) => toggleTagFilter(tag)}
            >
              {tag}
            </Button>
          );
        })}
      </div>
    </>
  );
}

export default FilterBySection;
