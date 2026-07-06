import { getLevelColorStyle } from '../../../../utils/criteriaLevelColors';

const PART_LEVELS = [1, 2, 3, 4, 5];

const LevelLegend = () => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px 20px',
      marginTop: 16,
      paddingTop: 12,
      borderTop: '1px solid #f0f0f0',
    }}
  >
    {PART_LEVELS.map((level) => {
      const levelStyle = getLevelColorStyle(level);
      return (
        <div
          key={level}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#595959' }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: levelStyle.bg,
              flexShrink: 0,
            }}
          />
          <span>{`Mức ${level}`}</span>
        </div>
      );
    })}
  </div>
);

export default LevelLegend;
