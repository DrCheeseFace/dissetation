import type { ColumnSummary } from '@/model/DashboardInfo';
import { observer } from 'mobx-react-lite';
import { type FC } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { TypographyP } from './typography';
import Glyph from './glyph';

interface GlyphCardProps {
  columnSummary: ColumnSummary;
  onClick?: () => void;
  selectedGlyphIdx?: number;
}

export const GlyphCard: FC<GlyphCardProps> = observer(
  ({ columnSummary, onClick }) => {
    onClick; // TODO IMPLEMENT AND REMOVE ME

    const total =
      (columnSummary.non_null_count || 0) + (columnSummary.null_count || 0);
    let missingPct = total > 0 ? (columnSummary.null_count / total) * 100 : 0;
    console.log(missingPct);

    return (
      <Card className="relative flex flex-col w-full aspect-[3/5] pt-3 overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="truncate pb-1">
            {columnSummary.column_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow flex items-center justify-center min-h-0 p-1 px-[5px] ">
          <Glyph
            columnSummary={columnSummary}
            onClick={undefined} /* TODO onclick stuffs */
          />
        </CardContent>

        <CardFooter className="flex-col shrink-0">
          <TypographyP>
            missing %: {missingPct.toPrecision(3)} type: {columnSummary.histogram?.data_type}
          </TypographyP>
        </CardFooter>
      </Card>
    );
  },
);

export default GlyphCard;
