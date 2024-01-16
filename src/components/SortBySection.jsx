import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

function SortBySection({ sortBy, setSortBy }) {
  const radios = [
    { name: 'Sort by Date', value: 'search_by_date' },
    { name: 'Sort by Relevance', value: 'search' },
  ];

  return (
    <>
      <div className="arrow-up-sortby"></div>
      <div className="sortby-container d-flex">
        <ButtonGroup className="my-auto">
          {radios.map((radio, idx) => (
            <ToggleButton
              key={idx}
              id={`radio-${idx}`}
              type="radio"
              variant="outline-light"
              name="radio"
              value={radio.value}
              checked={sortBy === radio.value}
              onChange={(e) => setSortBy(e.currentTarget.value)}
            >
              {radio.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>
    </>
  );
}

export default SortBySection;