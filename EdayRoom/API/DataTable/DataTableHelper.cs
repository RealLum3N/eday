﻿using System.Collections.Generic;

namespace EdayRoom.API.DataTable
{
    public class DataTableHelper
    {
        public int sEcho { get; set; }
        public int iTotalRecords { get; set; }
        public int iTotalDisplayRecords { get; set; }
        public List<List<string>> aaData { get; set; }
    }
}