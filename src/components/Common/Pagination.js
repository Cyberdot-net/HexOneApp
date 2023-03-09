import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { ITEMS_PER_PAGE } from "contracts/Constants";

function CustomPagination({ page, count, perPage, onChange, className }) {

  const pageCount = Math.ceil(count / perPage);
  const startIndex = Math.max(Math.min(page - 2, pageCount - 4), 0);
  const endIndex = Math.min(startIndex + 4, pageCount - 1);

  const pageNumbers = Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i + 1);

  const handlePageChange = (newPage) => {
    if (newPage !== page && newPage >= 1 && newPage <= pageCount) {
      onChange(newPage);
    }
  };

  return (
    pageCount > 1 && <Pagination
        className={`pagination pagination-info ${className || ""}`}
        listClassName="pagination-info"
      >
        {pageCount > 10 && <PaginationItem>
          <PaginationLink
            aria-label="First"
            {...(page > 1) && {onClick: () => handlePageChange(1)}}
            disabled={page < 2}
          >
            <span aria-hidden={true}>
              <i
                aria-hidden={true}
                className="tim-icons icon-double-left"
              />
            </span>
          </PaginationLink>
        </PaginationItem>}
        <PaginationItem>
          <PaginationLink
            aria-label="Previous"
            {...(page > 1) && {onClick: () => handlePageChange(page - 1)}}
            disabled={page < 2}
          >
            <span aria-hidden={true}>
              <i
                aria-hidden={true}
                className="tim-icons icon-minimal-left"
              />
            </span>
          </PaginationLink>
        </PaginationItem>
        {pageNumbers.map(r => 
        <PaginationItem key={r} {...(page === r) && {className: "active"}}>
          <PaginationLink
            onClick={() => handlePageChange(r)}
          >
            {r}
          </PaginationLink>
        </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink
            aria-label="Next"
            {...(page < pageCount) && {onClick: () => handlePageChange(page + 1)}}
            disabled={page === pageCount}
          >
            <span aria-hidden={true}>
              <i
                aria-hidden={true}
                className="tim-icons icon-minimal-right"
              />
            </span>
          </PaginationLink>
        </PaginationItem>
        {pageCount > 10 && <PaginationItem>
          <PaginationLink
            aria-label="Last"
            {...(page > 1) && {onClick: () => handlePageChange(pageCount)}}
            disabled={page === pageCount}
          >
            <span aria-hidden={true}>
              <i
                aria-hidden={true}
                className="tim-icons icon-double-right"
              />
            </span>
          </PaginationLink>
        </PaginationItem>}
      </Pagination>
  );
}

CustomPagination.defaultProps = {
  perPage: ITEMS_PER_PAGE
};

export default CustomPagination;